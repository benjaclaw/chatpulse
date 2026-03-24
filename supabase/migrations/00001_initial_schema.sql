-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- Members (links users to workspaces)
create table public.members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  unique (user_id, workspace_id)
);

-- Company info (JSONB for flexible schema)
create table public.company_info (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- Knowledge base with vector embeddings
create table public.knowledge (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  content text not null,
  embedding vector(1536),
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Chatbot configuration
create table public.chatbot_config (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade unique,
  name text not null default 'My Chatbot',
  prompt text,
  welcome_message text default 'Hi! How can I help you today?',
  fallback_response text default 'I''m not sure about that. Let me connect you with someone who can help.',
  widget_styling jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Conversations (from website visitors)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  visitor_id text not null,
  started_at timestamptz not null default now()
);

-- Messages within conversations
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Tracked questions for insights
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  question text not null,
  count integer not null default 1,
  last_asked_at timestamptz not null default now(),
  answered boolean not null default false
);

-- Invites
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_members_user_id on public.members(user_id);
create index idx_members_workspace_id on public.members(workspace_id);
create index idx_knowledge_workspace_id on public.knowledge(workspace_id);
create index idx_conversations_workspace_id on public.conversations(workspace_id);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_questions_workspace_id on public.questions(workspace_id);
create index idx_invites_token on public.invites(token);
create index idx_invites_email on public.invites(email);
create index idx_workspaces_slug on public.workspaces(slug);
