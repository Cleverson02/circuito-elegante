import {
  pgTable, uuid, text, boolean, numeric, integer, real,
  timestamp, jsonb, char, uniqueIndex, index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { vector } from 'drizzle-orm/pg-core';

// ==================== HOTELS ====================
export const hotels = pgTable('hotels', {
  id:             uuid('id').primaryKey().defaultRandom(),
  name:           text('name').notNull(),
  slug:           text('slug').notNull().unique(),
  region:         text('region').notNull(),
  experience:     text('experience').notNull(),
  destination:    text('destination').notNull(),
  municipality:   text('municipality').notNull(),
  uf:             char('uf', { length: 2 }).notNull(),
  hasApi:         boolean('has_api').notNull().default(false),
  elevareHotelId: text('elevare_hotel_id').unique(),
  bradescoCoupon: boolean('bradesco_coupon').notNull().default(false),
  petFriendly:    boolean('pet_friendly').notNull().default(false),
  poolHeated:     boolean('pool_heated').notNull().default(false),
  data:           jsonb('data').notNull().default({}),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_hotels_exp_region').on(table.experience, table.region),
  index('idx_hotels_destination').on(table.destination),
  index('idx_hotels_uf').on(table.uf),
]);

// ==================== GUEST PROFILES ====================
export const guestProfiles = pgTable('guest_profiles', {
  id:                uuid('id').primaryKey().defaultRandom(),
  phoneNumber:       text('phone_number').notNull().unique(),
  email:             text('email'),
  name:              text('name'),
  language:          text('language').notNull().default('pt'),
  travelHistory:     jsonb('travel_history').notNull().default([]),
  preferences:       jsonb('preferences').notNull().default({}),
  specialDates:      jsonb('special_dates').notNull().default([]),
  totalSpent:        numeric('total_spent', { precision: 12, scale: 2 }).notNull().default('0.00'),
  interactionCount:  integer('interaction_count').notNull().default(0),
  lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }),
  anonimizedAt:      timestamp('anonimized_at', { withTimezone: true }),
  createdAt:         timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ==================== CONVERSATIONS ====================
export const conversations = pgTable('conversations', {
  id:             uuid('id').primaryKey().defaultRandom(),
  sessionId:      text('session_id').notNull(),
  guestId:        uuid('guest_id').references(() => guestProfiles.id, { onDelete: 'set null' }),
  userId:         text('user_id').notNull(),
  channel:        text('channel').notNull(),
  messages:       jsonb('messages').notNull().default([]),
  messageCount:   integer('message_count').notNull().default(0),
  hotelFocus:     uuid('hotel_focus').references(() => hotels.id, { onDelete: 'set null' }),
  handover:       boolean('handover').notNull().default(false),
  handoverReason: text('handover_reason'),
  resolved:       boolean('resolved').notNull().default(false),
  metadata:       jsonb('metadata').notNull().default({}),
  startedAt:      timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  endedAt:        timestamp('ended_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_conv_session').on(table.sessionId),
  index('idx_conv_guest').on(table.guestId),
  index('idx_conv_created').on(table.createdAt),
]);

// ==================== FAQ EMBEDDINGS ====================
export const faqEmbeddings = pgTable('faq_embeddings', {
  id:               uuid('id').primaryKey().defaultRandom(),
  hotelId:          uuid('hotel_id').notNull().references(() => hotels.id, { onDelete: 'cascade' }),
  sectionTitle:     text('section_title').notNull(),
  content:          text('content').notNull(),
  contentHash:      text('content_hash').notNull(),
  embedding:        vector('embedding', { dimensions: 1536 }).notNull(),
  embeddingVersion: text('embedding_version').notNull().default('text-embedding-3-small'),
  source:           text('source').notNull().default('google-drive'),
  fileName:         text('file_name'),
  lastSyncedAt:     timestamp('last_synced_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('idx_faq_hotel_hash').on(table.hotelId, table.contentHash),
  index('idx_faq_hotel').on(table.hotelId),
]);

// ==================== DATA DELETION REQUESTS ====================
export const dataDeletionRequests = pgTable('data_deletion_requests', {
  id:             uuid('id').primaryKey().defaultRandom(),
  guestId:        uuid('guest_id').notNull().references(() => guestProfiles.id, { onDelete: 'cascade' }),
  requesterEmail: text('requester_email'),
  dataScope:      text('data_scope').notNull().default('full'),
  status:         text('status').notNull().default('pending'),
  reason:         text('reason'),
  processedBy:    text('processed_by'),
  proofUrl:       text('proof_url'),
  requestedAt:    timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ==================== WEBHOOK EVENTS ====================
export const webhookEvents = pgTable('webhook_events', {
  id:           uuid('id').primaryKey().defaultRandom(),
  source:       text('source').notNull(),
  eventType:    text('event_type').notNull(),
  payload:      jsonb('payload').notNull(),
  sessionId:    text('session_id'),
  guestId:      uuid('guest_id').references(() => guestProfiles.id, { onDelete: 'set null' }),
  status:       text('status').notNull().default('received'),
  errorMessage: text('error_message'),
  processedAt:  timestamp('processed_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_webhook_source').on(table.source),
  index('idx_webhook_type').on(table.eventType),
  index('idx_webhook_created').on(table.createdAt),
]);

// ==================== AGENT METRICS ====================
export const agentMetrics = pgTable('agent_metrics', {
  id:                    uuid('id').primaryKey().defaultRandom(),
  sessionId:             text('session_id').notNull(),
  conversationId:        uuid('conversation_id').references(() => conversations.id, { onDelete: 'set null' }),
  intent:                text('intent'),
  confidence:            real('confidence'),
  language:              text('language'),
  toolsUsed:             text('tools_used').array().notNull().default(sql`'{}'`),
  latencyIntentMs:       integer('latency_intent_ms'),
  latencyOrchestratorMs: integer('latency_orchestrator_ms'),
  latencyPersonaMs:      integer('latency_persona_ms'),
  latencySafetyMs:       integer('latency_safety_ms'),
  latencyTotalMs:        integer('latency_total_ms'),
  safetyApproved:        boolean('safety_approved').notNull().default(true),
  safetyCategory:        text('safety_category'),
  guardrailTriggered:    boolean('guardrail_triggered').notNull().default(false),
  guardrailType:         text('guardrail_type'),
  channel:               text('channel'),
  createdAt:             timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('idx_metrics_session').on(table.sessionId),
  index('idx_metrics_created').on(table.createdAt),
]);
