-- Data retention: automatic cleanup via pg_cron
-- Runs daily at 03:00 UTC

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.schedule(
  'cleanup-old-messages',
  '0 3 * * *',
  $$
  -- Delete messages older than 90 days
  DELETE FROM public.messages 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Delete orphaned conversations (no messages left, older than 90 days)
  DELETE FROM public.conversations 
  WHERE id NOT IN (SELECT DISTINCT conversation_id FROM public.messages)
  AND started_at < NOW() - INTERVAL '90 days';
  
  -- Delete archived leads older than 30 days
  DELETE FROM public.leads 
  WHERE status = 'archived' 
  AND created_at < NOW() - INTERVAL '30 days';
  $$
);
