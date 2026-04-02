import { getRedisClient } from './redis-client.js';
import { REDIS_KEYS, REDIS_TTL } from './keys.js';

export interface SessionData {
  hotelId: string;
  guestPhone: string;
  language: string;
  agentState?: string;
  context?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface RequestData {
  sessionId: string;
  intent?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const redis = getRedisClient();
  const data = await redis.get(REDIS_KEYS.session(sessionId));
  if (!data) return null;
  return JSON.parse(data) as SessionData;
}

export async function setSession(
  sessionId: string,
  data: SessionData,
  ttlSeconds: number = REDIS_TTL.session,
): Promise<void> {
  const redis = getRedisClient();
  const payload = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  await redis.set(REDIS_KEYS.session(sessionId), payload, 'EX', ttlSeconds);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(REDIS_KEYS.session(sessionId));
}

export async function getRequest(requestId: string): Promise<RequestData | null> {
  const redis = getRedisClient();
  const data = await redis.get(REDIS_KEYS.request(requestId));
  if (!data) return null;
  return JSON.parse(data) as RequestData;
}

export async function setRequest(
  requestId: string,
  data: RequestData,
  ttlSeconds: number = REDIS_TTL.request,
): Promise<void> {
  const redis = getRedisClient();
  await redis.set(REDIS_KEYS.request(requestId), JSON.stringify(data), 'EX', ttlSeconds);
}

export async function deleteRequest(requestId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(REDIS_KEYS.request(requestId));
}
