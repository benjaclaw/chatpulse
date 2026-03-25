-- Live chat: agent presence, assignments, conversation status, canned responses

-- Agent presence
CREATE TABLE IF NOT EXISTS agent_presence (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'busy', 'away', 'offline')),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

ALTER TABLE agent_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view presence in their workspace"
  ON agent_presence FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own presence"
  ON agent_presence FOR ALL
  USING (user_id = auth.uid());

-- Agent assignments
CREATE TABLE IF NOT EXISTS agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view assignments in their workspace"
  ON agent_assignments FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE workspace_id IN (
      SELECT workspace_id FROM members WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Members can manage assignments"
  ON agent_assignments FOR ALL
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE workspace_id IN (
      SELECT workspace_id FROM members WHERE user_id = auth.uid()
    )
  ));

-- Add status and assigned_to to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'ai' CHECK (status IN ('ai', 'waiting', 'human', 'closed'));
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Allow 'agent' role in messages
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_role_check;
ALTER TABLE messages ADD CONSTRAINT messages_role_check CHECK (role IN ('user', 'assistant', 'agent', 'system'));

-- Add metadata column for internal notes
ALTER TABLE messages ADD COLUMN IF NOT EXISTS metadata jsonb;

-- Business hours on workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS business_hours jsonb;

-- Canned responses
CREATE TABLE IF NOT EXISTS canned_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  shortcut text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE canned_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view canned responses in their workspace"
  ON canned_responses FOR SELECT
  USING (workspace_id IN (SELECT workspace_id FROM members WHERE user_id = auth.uid()));

CREATE POLICY "Members can manage canned responses"
  ON canned_responses FOR ALL
  USING (workspace_id IN (SELECT workspace_id FROM members WHERE user_id = auth.uid()));

-- Enable realtime on relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE agent_presence;
-- messages and conversations should already be in realtime per spec

-- Indexes
CREATE INDEX IF NOT EXISTS idx_agent_presence_workspace ON agent_presence(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_assignments_conversation ON agent_assignments(conversation_id);
CREATE INDEX IF NOT EXISTS idx_canned_responses_workspace ON canned_responses(workspace_id);
