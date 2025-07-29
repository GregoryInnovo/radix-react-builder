
-- Create table for residue types
CREATE TABLE public.tipos_residuo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.tipos_residuo ENABLE ROW LEVEL SECURITY;

-- Everyone can view active residue types
CREATE POLICY "Anyone can view active residue types"
  ON public.tipos_residuo
  FOR SELECT
  USING (activo = true);

-- Only admins can manage residue types
CREATE POLICY "Admins can manage residue types"
  ON public.tipos_residuo
  FOR ALL
  USING (is_current_user_admin());

-- Insert default residue types
INSERT INTO public.tipos_residuo (nombre, descripcion) VALUES
  ('cascara_fruta', 'Cáscara de fruta'),
  ('posos_cafe', 'Posos de café'),
  ('restos_vegetales', 'Restos vegetales'),
  ('cascara_huevo', 'Cáscara de huevo'),
  ('restos_cereales', 'Restos de cereales'),
  ('otros', 'Otros');

-- Create trigger for updated_at
CREATE TRIGGER update_tipos_residuo_updated_at
  BEFORE UPDATE ON public.tipos_residuo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update lotes table to reference tipos_residuo
ALTER TABLE public.lotes ADD COLUMN tipo_residuo_id UUID;

-- Create foreign key relationship
ALTER TABLE public.lotes ADD CONSTRAINT fk_lotes_tipo_residuo 
  FOREIGN KEY (tipo_residuo_id) REFERENCES public.tipos_residuo(id);

-- Update existing lotes to reference the new tipos_residuo table
UPDATE public.lotes SET tipo_residuo_id = (
  SELECT id FROM public.tipos_residuo WHERE nombre = lotes.tipo_residuo
) WHERE tipo_residuo_id IS NULL;

-- Make tipo_residuo_id required after migration
ALTER TABLE public.lotes ALTER COLUMN tipo_residuo_id SET NOT NULL;
