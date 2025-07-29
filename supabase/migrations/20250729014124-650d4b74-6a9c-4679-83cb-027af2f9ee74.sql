-- Remove the old tipo_residuo column from lotes table
ALTER TABLE public.lotes DROP COLUMN IF EXISTS tipo_residuo;

-- Update existing lotes to have proper tipo_residuo_id values if null
UPDATE public.lotes 
SET tipo_residuo_id = (SELECT id FROM public.tipos_residuo WHERE nombre = 'otros' LIMIT 1)
WHERE tipo_residuo_id IS NULL;