-- Plans table
create table if not exists plans (
  id text primary key,
  name text not null,
  price_nok integer not null default 0,
  message_limit integer not null default 100,
  features jsonb not null default '[]'::jsonb
);

-- Seed plan data
insert into plans (id, name, price_nok, message_limit, features) values
  ('free',    'Free',    0,    100,   '["basic_chat","knowledge_base"]'),
  ('basic',   'Basic',   499,  1000,  '["basic_chat","knowledge_base","insights","leads"]'),
  ('startup', 'Startup', 990,  3000,  '["basic_chat","knowledge_base","insights","leads","logo","white_label","document_upload"]'),
  ('pro',     'Pro',     4990, 15000, '["basic_chat","knowledge_base","insights","leads","logo","white_label","document_upload","priority_support","team_members"]')
on conflict (id) do nothing;

-- Add plan fields to workspaces
alter table workspaces
  add column if not exists plan_id text not null default 'free' references plans(id),
  add column if not exists message_count integer not null default 0,
  add column if not exists billing_cycle_start timestamptz default now();
