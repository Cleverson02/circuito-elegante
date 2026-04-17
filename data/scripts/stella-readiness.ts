/**
 * Stella Readiness Check — valida se o ambiente está 100% pronto.
 *
 * Uso:
 *   node --env-file=.env --import=tsx data/scripts/stella-readiness.ts
 *
 * Checa:
 *   1. Variáveis de ambiente obrigatórias
 *   2. Conexão Redis
 *   3. Conexão Supabase/Postgres
 *   4. OpenAI API key válida
 *   5. Evolution API alcançável (se configurada)
 *   6. Elevare API alcançável (se configurada)
 */

import { Redis } from 'ioredis';
import postgres from 'postgres';

type Check = { name: string; required: boolean; result: 'pass' | 'fail' | 'skip'; detail?: string };

const checks: Check[] = [];

function record(name: string, required: boolean, result: 'pass' | 'fail' | 'skip', detail?: string) {
  checks.push({ name, required, result, detail });
}

async function checkEnvVars() {
  const required = ['OPENAI_API_KEY', 'REDIS_URL'];
  const recommended = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const optional = [
    'EVOLUTION_API_URL',
    'EVOLUTION_API_KEY',
    'ELEVARE_API_URL',
    'ELEVARE_CLIENT_ID',
    'ELEVARE_CLIENT_SECRET',
    'ELEVARE_WEBHOOK_SECRET',
  ];

  for (const v of required) {
    if (process.env[v]) record(`env.${v}`, true, 'pass');
    else record(`env.${v}`, true, 'fail', 'não definida');
  }
  for (const v of recommended) {
    if (process.env[v]) record(`env.${v}`, false, 'pass');
    else record(`env.${v}`, false, 'skip', 'recomendada mas ausente');
  }
  for (const v of optional) {
    if (process.env[v]) record(`env.${v}`, false, 'pass');
    else record(`env.${v}`, false, 'skip', 'opcional');
  }
}

async function checkRedis() {
  const url = process.env['REDIS_URL'];
  if (!url) return record('redis', true, 'skip', 'REDIS_URL ausente');

  const client = new Redis(url, { maxRetriesPerRequest: 1, lazyConnect: true });
  try {
    await client.connect();
    const pong = await client.ping();
    if (pong === 'PONG') record('redis', true, 'pass', url);
    else record('redis', true, 'fail', `resposta inesperada: ${pong}`);
  } catch (e) {
    record('redis', true, 'fail', e instanceof Error ? e.message : String(e));
  } finally {
    await client.quit().catch(() => {});
  }
}

async function checkPostgres() {
  const url = process.env['DATABASE_URL'];
  if (!url) return record('postgres', false, 'skip', 'DATABASE_URL ausente');

  try {
    const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 10 });
    const rows = await sql`SELECT 1 as ok`;
    if (rows[0]?.['ok'] === 1) record('postgres', true, 'pass');
    else record('postgres', true, 'fail', 'query retornou vazio');
    await sql.end();
  } catch (e) {
    record('postgres', true, 'fail', e instanceof Error ? e.message : String(e));
  }
}

async function checkOpenAI() {
  const key = process.env['OPENAI_API_KEY'];
  if (!key) return record('openai', true, 'skip', 'OPENAI_API_KEY ausente');

  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) record('openai', true, 'pass', `${res.status} OK`);
    else record('openai', true, 'fail', `HTTP ${res.status}`);
  } catch (e) {
    record('openai', true, 'fail', e instanceof Error ? e.message : String(e));
  }
}

async function checkEvolution() {
  const url = process.env['EVOLUTION_API_URL'];
  const key = process.env['EVOLUTION_API_KEY'];
  if (!url || !key) return record('evolution', false, 'skip', 'não configurada');

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/`, {
      headers: { apikey: key },
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) record('evolution', false, 'pass', `${res.status} OK`);
    else record('evolution', false, 'fail', `HTTP ${res.status}`);
  } catch (e) {
    record('evolution', false, 'fail', e instanceof Error ? e.message : String(e));
  }
}

async function checkElevare() {
  const url = process.env['ELEVARE_API_URL'];
  const clientId = process.env['ELEVARE_CLIENT_ID'];
  const clientSecret = process.env['ELEVARE_CLIENT_SECRET'];
  if (!url || !clientId || !clientSecret) {
    return record('elevare', false, 'skip', 'não configurada');
  }

  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/global-agent/hotels?active=true`, {
      headers: {
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
      },
      signal: AbortSignal.timeout(5000),
    });
    // Qualquer resposta HTTP (inclusive 401/403/404) indica que o endpoint respondeu —
    // a rede + TLS + DNS estão OK. Auth propriamente dita é validada em runtime.
    record('elevare', false, 'pass', `alcançável (${res.status})`);
  } catch (e) {
    record('elevare', false, 'fail', e instanceof Error ? e.message : String(e));
  }
}

async function main() {
  console.log('\n🔍 STELLA READINESS CHECK\n');

  await checkEnvVars();
  await checkRedis();
  await checkPostgres();
  await checkOpenAI();
  await checkEvolution();
  await checkElevare();

  const pass = checks.filter((c) => c.result === 'pass');
  const fail = checks.filter((c) => c.result === 'fail');
  const skip = checks.filter((c) => c.result === 'skip');
  const requiredFail = fail.filter((c) => c.required);

  const icon = (r: Check['result']) => (r === 'pass' ? '✅' : r === 'fail' ? '❌' : '⚠️ ');

  for (const c of checks) {
    const tag = c.required ? '[REQ]' : '[OPT]';
    console.log(`  ${icon(c.result)}  ${tag} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  }

  console.log(`\n📊 ${pass.length} pass · ${fail.length} fail · ${skip.length} skip`);

  if (requiredFail.length > 0) {
    console.log(`\n❌ ${requiredFail.length} check(s) obrigatório(s) falharam. Stella NÃO está pronta.\n`);
    process.exit(1);
  }

  console.log('\n✅ Ambiente pronto para a Stella.\n');
  process.exit(0);
}

main().catch((e) => {
  console.error('Readiness check crashed:', e);
  process.exit(2);
});
