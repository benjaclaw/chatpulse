-- Add language column to workspaces for i18n
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'nb' 
CHECK (language IN ('nb', 'en'));
