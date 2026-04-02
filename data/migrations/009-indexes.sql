-- Migration 009: Create all indexes (25+)
-- Depends on: all tables

-- HOTELS
CREATE INDEX IF NOT EXISTS idx_hotels_region ON hotels(region);
CREATE INDEX IF NOT EXISTS idx_hotels_experience ON hotels(experience);
CREATE INDEX IF NOT EXISTS idx_hotels_has_api ON hotels(has_api);
CREATE INDEX IF NOT EXISTS idx_hotels_destination ON hotels(destination);
CREATE INDEX IF NOT EXISTS idx_hotels_uf ON hotels(uf);
CREATE INDEX IF NOT EXISTS idx_hotels_bradesco ON hotels(bradesco_coupon) WHERE bradesco_coupon = true;
CREATE INDEX IF NOT EXISTS idx_hotels_data_gin ON hotels USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_hotels_name_trgm ON hotels USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_hotels_exp_region ON hotels(experience, region);

-- GUEST_PROFILES
CREATE INDEX IF NOT EXISTS idx_guests_email ON guest_profiles(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_guests_last_interaction ON guest_profiles(last_interaction_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_guests_anonimized ON guest_profiles(anonimized_at) WHERE anonimized_at IS NULL;

-- CONVERSATIONS
CREATE INDEX IF NOT EXISTS idx_conv_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conv_guest ON conversations(guest_id) WHERE guest_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conv_hotel ON conversations(hotel_focus) WHERE hotel_focus IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_conv_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_conv_handover ON conversations(handover) WHERE handover = true;
CREATE INDEX IF NOT EXISTS idx_conv_created ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_active ON conversations(ended_at) WHERE ended_at IS NULL;

-- FAQ_EMBEDDINGS
CREATE INDEX IF NOT EXISTS idx_faq_hotel ON faq_embeddings(hotel_id);
-- HNSW manual: m=16, ef_construction=64 — optimized for ~430 vectors
CREATE INDEX IF NOT EXISTS idx_faq_embedding_hnsw ON faq_embeddings
  USING hnsw(embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- DATA_DELETION_REQUESTS
CREATE INDEX IF NOT EXISTS idx_deletion_status ON data_deletion_requests(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_deletion_guest ON data_deletion_requests(guest_id);

-- WEBHOOK_EVENTS
CREATE INDEX IF NOT EXISTS idx_webhook_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_events(status) WHERE status != 'processed';
CREATE INDEX IF NOT EXISTS idx_webhook_created ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_session ON webhook_events(session_id) WHERE session_id IS NOT NULL;

-- AGENT_METRICS
CREATE INDEX IF NOT EXISTS idx_metrics_session ON agent_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_metrics_created ON agent_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_intent ON agent_metrics(intent);
CREATE INDEX IF NOT EXISTS idx_metrics_safety ON agent_metrics(safety_approved) WHERE safety_approved = false;
CREATE INDEX IF NOT EXISTS idx_metrics_guardrail ON agent_metrics(guardrail_triggered) WHERE guardrail_triggered = true;
