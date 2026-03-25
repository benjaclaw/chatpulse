-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- Allow authenticated users to upload to the documents bucket
CREATE POLICY "Workspace members can upload docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to read from the documents bucket
CREATE POLICY "Workspace members can read docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

-- Add file columns to knowledge table
ALTER TABLE public.knowledge ADD COLUMN IF NOT EXISTS file_url text;
ALTER TABLE public.knowledge ADD COLUMN IF NOT EXISTS file_name text;
