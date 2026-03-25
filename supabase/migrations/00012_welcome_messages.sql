-- Add welcome_messages JSONB column for multilingual welcome messages
ALTER TABLE public.chatbot_config
ADD COLUMN IF NOT EXISTS welcome_messages jsonb DEFAULT '{}';
