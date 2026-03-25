-- RPC to create workspace + add creator as owner atomically
-- Bypasses the RLS chicken-and-egg problem where INSERT succeeds
-- but SELECT fails because the user isn't a member yet.
CREATE OR REPLACE FUNCTION public.create_workspace(ws_name text, ws_slug text)
RETURNS uuid AS $$
DECLARE
  ws_id uuid;
BEGIN
  INSERT INTO public.workspaces (name, slug)
  VALUES (ws_name, ws_slug)
  RETURNING id INTO ws_id;

  INSERT INTO public.members (user_id, workspace_id, role)
  VALUES (auth.uid(), ws_id, 'owner');

  RETURN ws_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
