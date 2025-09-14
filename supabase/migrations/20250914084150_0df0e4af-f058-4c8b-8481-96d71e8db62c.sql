-- Add missing fields to notificaciones table
ALTER TABLE public.notificaciones 
ADD COLUMN IF NOT EXISTS redirect_url TEXT,
ADD COLUMN IF NOT EXISTS entity_id UUID,
ADD COLUMN IF NOT EXISTS entity_type TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update existing notifications to have proper entity_type
UPDATE public.notificaciones 
SET entity_type = 'orden' 
WHERE tipo = 'orden' AND entity_type IS NULL;

UPDATE public.notificaciones 
SET entity_type = 'producto' 
WHERE tipo = 'producto' AND entity_type IS NULL;