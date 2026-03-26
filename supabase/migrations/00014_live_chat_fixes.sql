-- FIKS 1: RLS — prevent anon from inserting messages with role='agent'
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.messages;
CREATE POLICY "Controlled message insert" ON public.messages FOR INSERT TO anon, authenticated
WITH CHECK (
  role = 'user'
  OR (auth.uid() IS NOT NULL AND role IN ('agent', 'system'))
);

-- FIKS 1b: Ensure conversations insert requires valid workspace_id
DROP POLICY IF EXISTS "Anyone can insert conversations" ON public.conversations;
CREATE POLICY "Controlled conversation insert" ON public.conversations FOR INSERT TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.workspaces WHERE id = workspace_id)
);
