-- Add titulo field (required, max 25 characters)
ALTER TABLE public.lotes ADD COLUMN titulo VARCHAR(25) NOT NULL DEFAULT '';

-- Add fecha_vencimiento field 
ALTER TABLE public.lotes ADD COLUMN fecha_vencimiento DATE;

-- Migrate existing data: copy fecha_disponible to fecha_vencimiento
UPDATE public.lotes SET fecha_vencimiento = fecha_disponible WHERE fecha_disponible IS NOT NULL;

-- Add constraint to ensure fecha_vencimiento is in the future for new records
ALTER TABLE public.lotes ADD CONSTRAINT check_fecha_vencimiento_future 
CHECK (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURRENT_DATE);