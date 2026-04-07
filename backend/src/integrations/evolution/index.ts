// Evolution API Integration — Public API
// Barrel export for backend/src/integrations/evolution/
// Story 4.1 — WhatsApp Business API — Recepcao de Mensagens

export { EvolutionClient } from './client.js';
export { getEvolutionConfig, resetEvolutionConfig } from './config.js';

export {
  markAsReadDeferred,
  setPresenceOnline,
  setPresenceOffline,
} from './presence.js';

export type {
  EvolutionConfig,
  EvolutionResponse,
  EvolutionMessageType,
  EvolutionPresenceStatus,
  EvolutionConnectionStatus,
  EvolutionWebhookPayload,
  EvolutionMessageData,
  EvolutionMessageContent,
  EvolutionConnectionData,
  ParsedMessage,
} from './types.js';

export {
  EVOLUTION_REDIS_KEYS,
  EVOLUTION_REDIS_TTL,
} from './types.js';
