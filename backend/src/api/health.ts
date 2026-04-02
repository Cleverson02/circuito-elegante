import type { FastifyInstance } from 'fastify';

export type HealthChecker = () => Promise<{ status: string; details?: Record<string, unknown> }>;

const healthCheckers = new Map<string, HealthChecker>();

export function registerHealthChecker(name: string, checker: HealthChecker): void {
  healthCheckers.set(name, checker);
}

interface HealthCheckResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  checks: Record<string, { status: string; details?: Record<string, unknown> }>;
}

async function runHealthChecks(): Promise<HealthCheckResult> {
  const checks: HealthCheckResult['checks'] = {};
  let hasFailed = false;

  for (const [name, checker] of healthCheckers) {
    try {
      checks[name] = await checker();
    } catch (error) {
      hasFailed = true;
      checks[name] = {
        status: 'error',
        details: { message: error instanceof Error ? error.message : 'Unknown error' },
      };
    }
  }

  return {
    status: hasFailed ? 'degraded' : 'ok',
    timestamp: new Date().toISOString(),
    checks,
  };
}

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/health', async (_request, reply) => {
    const result = await runHealthChecks();

    // If no checkers registered yet, return basic ok
    if (healthCheckers.size === 0) {
      return reply.send({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    }

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
