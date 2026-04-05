import type { FastifyInstance } from 'fastify';

export type HealthChecker = () => Promise<{ status: string; details?: Record<string, unknown> }>;

const healthCheckers = new Map<string, HealthChecker>();

export function registerHealthChecker(name: string, checker: HealthChecker): void {
  healthCheckers.set(name, checker);
}

interface CheckResult {
  status: string;
  details?: Record<string, unknown>;
}

interface HealthCheckResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks: Record<string, CheckResult>;
}

async function runHealthChecks(): Promise<HealthCheckResult> {
  const checks: Record<string, CheckResult> = {};
  let hasDegraded = false;

  for (const [name, checker] of healthCheckers) {
    try {
      const result = await checker();
      checks[name] = result;
      if (result.status !== 'connected' && result.status !== 'ok' && result.status !== 'alive') {
        hasDegraded = true;
      }
    } catch (error) {
      hasDegraded = true;
      checks[name] = {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  return {
    status: hasDegraded ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    checks,
  };
}

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const result = await runHealthChecks();
    return reply.send(result);
  });

  app.get('/health/ready', async (_request, reply) => {
    const result = await runHealthChecks();
    const statusCode = result.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(result);
  });

  app.get('/health/live', async (_request, reply) => {
    return reply.send({ status: 'alive', timestamp: new Date().toISOString() });
  });
}
