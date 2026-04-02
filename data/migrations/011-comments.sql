-- Migration 011: Table and column comments
-- Documentation embedded in database schema

-- HOTELS
COMMENT ON TABLE hotels IS 'Rede de 92 hoteis do Circuito Elegante (32 integrados Elevare + 60 manuais)';
COMMENT ON COLUMN hotels.elevare_hotel_id IS 'ID na API Elevare. NULL = hotel manual (handover Chatwoot)';
COMMENT ON COLUMN hotels.data IS 'JSONB para metadados extensiveis: amenities, descricao curta, url_site, etc.';

-- GUEST_PROFILES
COMMENT ON TABLE guest_profiles IS 'Marketing Intelligence — dados acumulados de cada hospede (FR10)';
COMMENT ON COLUMN guest_profiles.phone_number IS 'Formato E.164: +5521999998888. UNIQUE — chave de lookup WhatsApp';
COMMENT ON COLUMN guest_profiles.anonimized_at IS 'LGPD NFR10: preenchido apos 24 meses de inatividade via cron mensal';

-- CONVERSATIONS
COMMENT ON TABLE conversations IS 'Historico de conversas — snapshot do Redis session ao expirar (NFR9: retencao 24 meses)';
COMMENT ON COLUMN conversations.messages IS 'JSONB array — max ~200 mensagens. Conversas longas: truncar primeiras mantendo ultimas 200';
COMMENT ON COLUMN conversations.session_id IS 'Correlacao com Redis session:{sessionId}. Permite lookup de conversa ativa';

-- FAQ_EMBEDDINGS
COMMENT ON TABLE faq_embeddings IS 'RAG knowledge base — ~430 chunks (92 hoteis x ~5 secoes). Sincronizado quinzenalmente do Google Drive';
COMMENT ON COLUMN faq_embeddings.content_hash IS 'SHA-256 do content. Permite upsert idempotente no cron de ingestao';
COMMENT ON COLUMN faq_embeddings.embedding IS 'vector(1536) via text-embedding-3-small. Busca por cosineDistance com threshold 0.7';
COMMENT ON COLUMN faq_embeddings.embedding_version IS 'Modelo usado para gerar o embedding. Permite re-embed ao trocar modelo';

-- DATA_DELETION_REQUESTS
COMMENT ON TABLE data_deletion_requests IS 'LGPD compliance — NFR10. Rastreabilidade de solicitacoes de exclusao/anonimizacao';

-- WEBHOOK_EVENTS
COMMENT ON TABLE webhook_events IS 'Audit trail de webhooks recebidos (FR25). Imutavel — nunca atualizar payload';
COMMENT ON COLUMN webhook_events.payload IS 'Body original do webhook — armazenado integralmente para debug e replay';

-- AGENT_METRICS
COMMENT ON TABLE agent_metrics IS 'Observabilidade do pipeline multi-agente. Cada interacao gera 1 registro';
