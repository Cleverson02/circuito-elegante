import { z } from 'zod';
import type { Logger } from 'winston';
import type {
  ElevareSearchParams,
  ElevareMultiSearchParams,
  ElevareSearchResponse,
  ElevareMultiSearchResponse,
  CircuitBreakerState,
} from './types.js';
import { CIRCUIT_BREAKER_CONFIG } from './types.js';
import type { ElevareConfig } from './config.js';
import {
  ElevareApiError,
  ElevareTimeoutError,
  ElevareCircuitOpenError,
  ElevareValidationError,
} from './errors.js';

// ─── Input Validation Schemas ───────────────────────────────────

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const SearchParamsSchema = z.object({
  hotelId: z.string().min(1),
  checkIn: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD'),
  checkOut: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD'),
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  childrenAges: z.array(z.number().int().min(0).max(17)).optional(),
});

const MultiSearchParamsSchema = z.object({
  city: z.string().min(1).optional(),
  region: z.string().min(1).optional(),
  checkIn: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD'),
  checkOut: z.string().regex(ISO_DATE_REGEX, 'Must be YYYY-MM-DD'),
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  maxResults: z.number().int().positive().optional(),
}).refine(
  (data) => data.city != null || data.region != null,
  { message: 'Either city or region must be provided' },
);

// ─── Retry Helpers ──────────────────────────────────────────────

const RETRYABLE_STATUS_CODES = new Set([500, 502, 503, 504]);
const RETRYABLE_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'UND_ERR_CONNECT_TIMEOUT',
]);

function isRetryableError(error: unknown): boolean {
  if (error instanceof ElevareApiError) {
    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }
  if (error instanceof ElevareTimeoutError) return true;
  if (error instanceof Error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code != null && RETRYABLE_ERROR_CODES.has(code);
  }
  return false;
}

function calculateRetryDelay(attempt: number, baseMs: number = 500): number {
  const exponentialDelay = baseMs * Math.pow(2, attempt);
  const jitterFactor = 1 + (Math.random() * 0.6 - 0.3); // 0.7–1.3
  return Math.round(exponentialDelay * jitterFactor);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── ElevareClient ──────────────────────────────────────────────

export class ElevareClient {
  private readonly config: ElevareConfig;
  private readonly logger: Logger;
  private readonly circuitBreaker: CircuitBreakerState;

  constructor(config: ElevareConfig, logger: Logger) {
    this.config = config;
    this.logger = logger.child({ module: 'elevare' });
    this.circuitBreaker = {
      status: 'CLOSED',
      failureCount: 0,
      successCount: 0,
      lastFailureAt: null,
      nextAttemptAt: null,
    };
  }

  // ─── Public API ─────────────────────────────────────────────

  async search(params: ElevareSearchParams): Promise<ElevareSearchResponse> {
    this.validateSearchParams(params);
    const queryParams = new URLSearchParams({
      q: params.hotelId,
      CheckIn: params.checkIn,
      CheckOut: params.checkOut,
      ad: String(params.adults),
    });
    if (params.children > 0) {
      queryParams.set('ch', String(params.children));
    }
    if (params.childrenAges && params.childrenAges.length > 0) {
      queryParams.set('ag', params.childrenAges.join(','));
    }
    return this.fetchWithResilience<ElevareSearchResponse>(
      `/global-agent/search?${queryParams.toString()}`,
      'GET',
    );
  }

  async multiSearch(
    params: ElevareMultiSearchParams,
  ): Promise<ElevareMultiSearchResponse> {
    this.validateMultiSearchParams(params);
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.set('city', params.city);
    if (params.region) queryParams.set('region', params.region);
    queryParams.set('checkIn', params.checkIn);
    queryParams.set('checkOut', params.checkOut);
    queryParams.set('adults', String(params.adults));
    queryParams.set('children', String(params.children));
    if (params.maxResults != null) {
      queryParams.set('maxResults', String(params.maxResults));
    }
    return this.fetchWithResilience<ElevareMultiSearchResponse>(
      `/global-agent/multi-search?${queryParams.toString()}`,
      'GET',
    );
  }

  /**
   * Low-level request method — exposed for domain-specific wrappers
   * (customers.ts, quotations.ts, reservations.ts). Inherits auth
   * (x-client-id + x-client-secret), retry, circuit breaker, timeout,
   * and logging from the base client.
   *
   * Callers pass the COMPLETE path (including `/global-agent/` prefix).
   */
  async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    return this.fetchWithResilience<T>(endpoint, method, body);
  }

  getCircuitBreakerState(): CircuitBreakerState {
    return { ...this.circuitBreaker };
  }

  // ─── Validation ─────────────────────────────────────────────

  private validateSearchParams(params: ElevareSearchParams): void {
    const result = SearchParamsSchema.safeParse(params);
    if (!result.success) {
      const issue = result.error.issues[0]!;
      throw new ElevareValidationError(
        String(issue.path.join('.')),
        (params as unknown as Record<string, unknown>)[String(issue.path[0])],
        issue.message,
      );
    }
  }

  private validateMultiSearchParams(params: ElevareMultiSearchParams): void {
    const result = MultiSearchParamsSchema.safeParse(params);
    if (!result.success) {
      const issue = result.error.issues[0]!;
      throw new ElevareValidationError(
        String(issue.path.join('.') || 'city|region'),
        undefined,
        issue.message,
      );
    }
  }

  // ─── Resilient Fetch (retry + circuit breaker + timeout) ────

  private async fetchWithResilience<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    this.checkCircuitBreaker();

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.executeFetch<T>(endpoint, method, body);
        this.onSuccess();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn('elevare_request_failed', {
          endpoint,
          attempt: attempt + 1,
          maxRetries: this.config.maxRetries,
          error: lastError.message,
          errorName: lastError.name,
          circuitBreakerStatus: this.circuitBreaker.status,
        });

        if (!isRetryableError(error) || attempt >= this.config.maxRetries) {
          this.onFailure();
          throw lastError;
        }

        const delay = calculateRetryDelay(attempt);
        this.logger.info('elevare_retry_scheduled', {
          endpoint,
          attempt: attempt + 1,
          delayMs: delay,
        });
        await sleep(delay);
      }
    }

    this.onFailure();
    throw lastError ?? new Error('Unexpected: no attempts made');
  }

  private async executeFetch<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeoutMs,
    );

    const startMs = Date.now();

    this.logger.info('elevare_request', {
      method,
      endpoint,
      // Auth credentials intentionally REDACTED from all logs
    });

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'x-client-id': this.config.clientId,
      'x-client-secret': this.config.clientSecret,
    };

    if (body !== undefined && method !== 'GET') {
      headers['Content-Type'] = 'application/json';
    }

    const init: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body !== undefined && method !== 'GET') {
      init.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, init);

      const durationMs = Date.now() - startMs;

      if (!response.ok) {
        let errorBody: unknown = null;
        try {
          errorBody = await response.json();
        } catch {
          // response body may not be JSON
        }

        this.logger.error('elevare_response_error', {
          endpoint,
          statusCode: response.status,
          durationMs,
          body: errorBody,
        });

        throw new ElevareApiError(
          `Elevare API returned ${response.status}`,
          response.status,
          endpoint,
          errorBody,
        );
      }

      const data = (await response.json()) as T;

      this.logger.info('elevare_response', {
        endpoint,
        statusCode: response.status,
        durationMs,
        requestId: (data as Record<string, unknown>)['requestId'] ?? null,
        resultCount:
          (data as Record<string, unknown>)['results'] != null
            ? ((data as Record<string, unknown>)['results'] as unknown[]).length
            : undefined,
      });

      return data;
    } catch (error) {
      if (
        error instanceof DOMException && error.name === 'AbortError' ||
        error instanceof Error && error.name === 'AbortError'
      ) {
        const durationMs = Date.now() - startMs;
        this.logger.error('elevare_timeout', {
          endpoint,
          timeoutMs: this.config.timeoutMs,
          durationMs,
        });
        throw new ElevareTimeoutError(this.config.timeoutMs, endpoint);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── Circuit Breaker ────────────────────────────────────────

  private checkCircuitBreaker(): void {
    const cb = this.circuitBreaker;

    if (cb.status === 'OPEN') {
      const now = Date.now();
      if (cb.nextAttemptAt != null && now >= cb.nextAttemptAt) {
        cb.status = 'HALF_OPEN';
        cb.successCount = 0;
        this.logger.info('circuit_breaker_transition', {
          from: 'OPEN',
          to: 'HALF_OPEN',
        });
      } else {
        throw new ElevareCircuitOpenError(
          cb.failureCount,
          cb.lastFailureAt,
          CIRCUIT_BREAKER_CONFIG.cooldownMs,
        );
      }
    }
  }

  private onSuccess(): void {
    const cb = this.circuitBreaker;

    if (cb.status === 'HALF_OPEN') {
      cb.successCount++;
      if (cb.successCount >= CIRCUIT_BREAKER_CONFIG.successThreshold) {
        cb.status = 'CLOSED';
        cb.failureCount = 0;
        cb.successCount = 0;
        cb.lastFailureAt = null;
        cb.nextAttemptAt = null;
        this.logger.info('circuit_breaker_transition', {
          from: 'HALF_OPEN',
          to: 'CLOSED',
        });
      }
    } else if (cb.status === 'CLOSED') {
      cb.failureCount = 0;
    }
  }

  private onFailure(): void {
    const cb = this.circuitBreaker;
    const now = Date.now();

    if (cb.status === 'HALF_OPEN') {
      cb.status = 'OPEN';
      cb.lastFailureAt = now;
      cb.nextAttemptAt = now + CIRCUIT_BREAKER_CONFIG.cooldownMs;
      cb.successCount = 0;
      this.logger.warn('circuit_breaker_transition', {
        from: 'HALF_OPEN',
        to: 'OPEN',
        failureCount: cb.failureCount,
      });
    } else if (cb.status === 'CLOSED') {
      cb.failureCount++;
      cb.lastFailureAt = now;
      if (cb.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
        cb.status = 'OPEN';
        cb.nextAttemptAt = now + CIRCUIT_BREAKER_CONFIG.cooldownMs;
        this.logger.warn('circuit_breaker_transition', {
          from: 'CLOSED',
          to: 'OPEN',
          failureCount: cb.failureCount,
        });
      }
    }
  }
}
