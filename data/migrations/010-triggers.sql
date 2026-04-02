-- Migration 010: Create triggers
-- 3 triggers: updated_at, message_count, guest_interaction

-- 1. Auto-update updated_at on all tables that have it
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON hotels
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON guest_profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON faq_embeddings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON data_deletion_requests
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- 2. Auto-increment message_count from JSONB array length
CREATE OR REPLACE FUNCTION trigger_update_message_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.message_count = jsonb_array_length(NEW.messages);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_message_count BEFORE INSERT OR UPDATE OF messages ON conversations
  FOR EACH ROW EXECUTE FUNCTION trigger_update_message_count();

-- 3. Auto-update guest interaction stats on new conversation
CREATE OR REPLACE FUNCTION trigger_update_guest_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE guest_profiles
  SET
    interaction_count = interaction_count + 1,
    last_interaction_at = now(),
    updated_at = now()
  WHERE id = NEW.guest_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guest_on_conversation AFTER INSERT ON conversations
  FOR EACH ROW
  WHEN (NEW.guest_id IS NOT NULL)
  EXECUTE FUNCTION trigger_update_guest_interaction();
