-- Create tipos_residuo table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.tipos_residuo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipos_residuo ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active residue types" ON public.tipos_residuo;
DROP POLICY IF EXISTS "Admins can manage residue types" ON public.tipos_residuo;

-- Create policies
CREATE POLICY "Anyone can view active residue types"
  ON public.tipos_residuo
  FOR SELECT
  USING (activo = true);

CREATE POLICY "Admins can manage residue types"
  ON public.tipos_residuo
  FOR ALL
  USING (is_current_user_admin());

-- Insert default residue types if they don't exist
INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'cascara_fruta', 'Cáscara de fruta'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'cascara_fruta');

INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'posos_cafe', 'Posos de café'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'posos_cafe');

INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'restos_vegetales', 'Restos vegetales'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'restos_vegetales');

INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'cascara_huevo', 'Cáscara de huevo'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'cascara_huevo');

INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'restos_cereales', 'Restos de cereales'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'restos_cereales');

INSERT INTO public.tipos_residuo (nombre, descripcion) 
SELECT 'otros', 'Otros'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_residuo WHERE nombre = 'otros');

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tipos_residuo_updated_at ON public.tipos_residuo;
CREATE TRIGGER update_tipos_residuo_updated_at
  BEFORE UPDATE ON public.tipos_residuo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add tipo_residuo_id column to lotes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='lotes' AND column_name='tipo_residuo_id') THEN
    ALTER TABLE public.lotes ADD COLUMN tipo_residuo_id UUID;
  END IF;
END $$;

-- Drop existing foreign key if it exists
ALTER TABLE public.lotes DROP CONSTRAINT IF EXISTS fk_lotes_tipo_residuo;

-- Create foreign key relationship
ALTER TABLE public.lotes ADD CONSTRAINT fk_lotes_tipo_residuo 
  FOREIGN KEY (tipo_residuo_id) REFERENCES public.tipos_residuo(id);