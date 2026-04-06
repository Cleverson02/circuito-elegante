/**
 * Elevare API — Custom error hierarchy.
 *
 * Structured errors with machine-readable properties for downstream
 * error handling (fallback, logging, metrics).
 */

export class ElevareApiError extends Error {
  public readonly statusCode: number;
  public readonly responseBody: unknown;
  public readonly endpoint: string;
  public readonly retryCount: number;

  constructor(
    message: string,
    statusCode: number,
    endpoint: string,
    responseBody: unknown = null,
    retryCount: number = 0,
  ) {
    super(message);
    this.name = 'ElevareApiError';
    this.statusCode = statusCode;
    this.endpoint = endpoint;
    this.responseBody = responseBody;
    this.retryCount = retryCount;
  }

  get isRetryable(): boolean {
    return this.statusCode >= 500;
  }
}

export class ElevareTimeoutError extends ElevareApiError {
  public readonly timeoutMs: number;

  constructor(timeoutMs: number, endpoint: string) {
    super(
      `Elevare API request timed out after ${timeoutMs}ms`,
      0,
      endpoint,
      null,
      0,
    );
    this.name = 'ElevareTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ElevareCircuitOpenError extends Error {
  public readonly lastFailureAt: number | null;
  public readonly failureCount: number;
  public readonly cooldownMs: number;

  constructor(
    failureCount: number,
    lastFailureAt: number | null,
    cooldownMs: number,
  ) {
    super(
      `Elevare circuit breaker is OPEN after ${failureCount} consecutive failures. ` +
      `Retry after ${cooldownMs}ms cooldown.`,
    );
    this.name = 'ElevareCircuitOpenError';
    this.failureCount = failureCount;
    this.lastFailureAt = lastFailureAt;
    this.cooldownMs = cooldownMs;
  }
}

export class ElevareValidationError extends Error {
  public readonly field: string;
  public readonly value: unknown;
  public readonly constraint: string;

  constructor(field: string, value: unknown, constraint: string) {
    super(`Elevare validation failed: ${field} — ${constraint}`);
    this.name = 'ElevareValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}
