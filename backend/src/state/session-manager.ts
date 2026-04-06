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

// ─── Session Context (Story 2.7) ─────────────────────────────

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SessionContext {
  hotelFocus: string | null;
  conversationHistory: ConversationMessage[];
  preferences: Record<string, unknown>;
  updatedAt: string;
}

export const MAX_CONVERSATION_HISTORY = 20;

export function createEmptyContext(): SessionContext {
  return {
    hotelFocus: null,
    conversationHistory: [],
    preferences: {},
    updatedAt: new Date().toISOString(),
  };
}

export async function getSessionContext(sessionId: string): Promise<SessionContext | null> {
  const redis = getRedisClient();
  const data = await redis.get(REDIS_KEYS.sessionCtx(sessionId));
  if (!data) return null;
  return JSON.parse(data) as SessionContext;
}

export async function updateSessionContext(
  sessionId: string,
  updates: Partial<Pick<SessionContext, 'hotelFocus' | 'preferences'>>,
): Promise<SessionContext> {
  const existing = await getSessionContext(sessionId) ?? createEmptyContext();

  if (updates.hotelFocus !== undefined) {
    existing.hotelFocus = updates.hotelFocus;
  }

  if (updates.preferences) {
    existing.preferences = { ...existing.preferences, ...updates.preferences };
  }

  existing.updatedAt = new Date().toISOString();

  const redis = getRedisClient();
  await redis.set(
    REDIS_KEYS.sessionCtx(sessionId),
    JSON.stringify(existing),
    'EX',
    REDIS_TTL.session,
  );

  return existing;
}

export async function addConversationMessage(
  sessionId: string,
  role: ConversationMessage['role'],
  content: string,
): Promise<SessionContext> {
  const existing = await getSessionContext(sessionId) ?? createEmptyContext();

  existing.conversationHistory.push({
    role,
    content,
    timestamp: new Date().toISOString(),
  });

  // Sliding window: keep only the last MAX_CONVERSATION_HISTORY messages
  if (existing.conversationHistory.length > MAX_CONVERSATION_HISTORY) {
    existing.conversationHistory = existing.conversationHistory.slice(
      existing.conversationHistory.length - MAX_CONVERSATION_HISTORY,
    );
  }

  existing.updatedAt = new Date().toISOString();

  const redis = getRedisClient();
  await redis.set(
    REDIS_KEYS.sessionCtx(sessionId),
    JSON.stringify(existing),
    'EX',
    REDIS_TTL.session,
  );

  return existing;
}

export async function deleteSessionContext(sessionId: string): Promise<void> {
  const redis = getRedisClient();
  await redis.del(REDIS_KEYS.sessionCtx(sessionId));
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
