-- Enable RLS on all tables
alter table public.workspaces enable row level security;
alter table public.members enable row level security;
alter table public.company_info enable row level security;
alter table public.knowledge enable row level security;
alter table public.chatbot_config enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.questions enable row level security;
alter table public.invites enable row level security;

-- Helper: check if user is a member of a workspace
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$ language sql security definer stable;

-- Helper: check if user is owner/admin of a workspace
create or replace function public.is_workspace_admin(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.members
    where workspace_id = ws_id and user_id = auth.uid() and role in ('owner', 'admin')
  );
$$ language sql security definer stable;

-- Workspaces: members can view their workspaces
create policy "Members can view workspace"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  to authenticated
  with check (true);

create policy "Admins can update workspace"
  on public.workspaces for update
  using (public.is_workspace_admin(id));

-- Members: workspace members can view other members
create policy "Members can view workspace members"
  on public.members for select
  using (public.is_workspace_member(workspace_id));

create policy "Users can insert own membership"
  on public.members for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Admins can insert members"
  on public.members for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "Admins can update members"
  on public.members for update
  using (public.is_workspace_admin(workspace_id));

create policy "Admins can delete members"
  on public.members for delete
  using (public.is_workspace_admin(workspace_id));

-- Company info: members can view, admins can edit
create policy "Members can view company info"
  on public.company_info for select
  using (public.is_workspace_member(workspace_id));

create policy "Admins can manage company info"
  on public.company_info for all
  using (public.is_workspace_admin(workspace_id));

-- Knowledge: members can view, admins can manage
create policy "Members can view knowledge"
  on public.knowledge for select
  using (public.is_workspace_member(workspace_id));

create policy "Admins can manage knowledge"
  on public.knowledge for all
  using (public.is_workspace_admin(workspace_id));

-- Chatbot config: members can view, admins can manage
create policy "Members can view chatbot config"
  on public.chatbot_config for select
  using (public.is_workspace_member(workspace_id));

create policy "Admins can manage chatbot config"
  on public.chatbot_config for all
  using (public.is_workspace_admin(workspace_id));

-- Conversations: workspace members can view
create policy "Members can view conversations"
  on public.conversations for select
  using (public.is_workspace_member(workspace_id));

create policy "Anyone can insert conversations"
  on public.conversations for insert
  to anon, authenticated
  with check (true);

-- Messages: accessible if user can see the conversation
create policy "Members can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and public.is_workspace_member(c.workspace_id)
    )
  );

create policy "Anyone can insert messages"
  on public.messages for insert
  to anon, authenticated
  with check (true);

-- Questions: workspace members can view
create policy "Members can view questions"
  on public.questions for select
  using (public.is_workspace_member(workspace_id));

create policy "System can manage questions"
  on public.questions for all
  to service_role
  using (true);

-- Invites: admins can manage, invited users can view their own
create policy "Admins can manage invites"
  on public.invites for all
  using (public.is_workspace_admin(workspace_id));

create policy "Users can view their own invites"
  on public.invites for select
  to authenticated
  using (email = (select email from auth.users where id = auth.uid()));
