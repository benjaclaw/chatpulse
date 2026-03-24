-- Super admin role
-- Adds a 'super_admin' role to members table and creates a profiles table for global user metadata

-- Add super_admin to allowed roles
alter table public.members drop constraint if exists members_role_check;
alter table public.members add constraint members_role_check
  check (role in ('owner', 'admin', 'member', 'super_admin'));

-- Global profiles table (not workspace-scoped)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, is_super_admin)
  values (new.id, new.email, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS for profiles
alter table public.profiles enable row level security;

-- Super admins can read all profiles
create policy "Super admins can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_super_admin = true
    )
  );

-- Users can read own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

-- Super admins can read ALL workspaces (override normal RLS)
create policy "Super admins can read all workspaces"
  on public.workspaces for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_super_admin = true
    )
  );

-- Super admins can read ALL members
create policy "Super admins can read all members"
  on public.members for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_super_admin = true
    )
  );
