-- Leads table (already run, saved for reference)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  email text not null,
  name text,
  status text not null default 'new' check (status in ('new', 'contacted', 'resolved', 'archived')),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_workspace_id on leads(workspace_id);
create index if not exists idx_leads_status on leads(workspace_id, status);
