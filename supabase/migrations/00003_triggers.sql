-- Auto-create workspace and set user as owner on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- We don't auto-create a workspace on signup.
  -- Instead, the app redirects to /create-workspace after signup.
  -- This trigger can be used for any user-level initialization if needed.
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.company_info
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.knowledge
  for each row execute function public.update_updated_at();

create trigger set_updated_at
  before update on public.chatbot_config
  for each row execute function public.update_updated_at();
