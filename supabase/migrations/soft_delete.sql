-- Add soft-delete columns
ALTER TABLE conversations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE messages ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Index for filtering non-deleted conversations
CREATE INDEX idx_conversations_deleted_at ON conversations (deleted_at);
