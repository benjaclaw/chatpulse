-- Add logo_url column to chatbot_config
ALTER TABLE public.chatbot_config ADD COLUMN IF NOT EXISTS logo_url text;

-- Create public logos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT DO NOTHING;
