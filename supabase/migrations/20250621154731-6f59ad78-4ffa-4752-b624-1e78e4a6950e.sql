
-- Create enum for ROA types
CREATE TYPE public.roa_type AS ENUM (
  'cascara_fruta',
  'posos_cafe',
  'restos_vegetales',
  'cascara_huevo',
  'restos_cereales',
  'otros'
);

-- Create enum for batch status
CREATE TYPE public.batch_status AS ENUM (
  'disponible',
  'reservado',
  'recogido',
  'cancelado'
);

-- Create lotes (batches) table
CREATE TABLE public.lotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tipo_residuo public.roa_type NOT NULL,
  peso_estimado DECIMAL(8,2) NOT NULL CHECK (peso_estimado > 0),
  ubicacion_lat DECIMAL(10, 8) NOT NULL,
  ubicacion_lng DECIMAL(11, 8) NOT NULL,
  direccion TEXT,
  estado public.batch_status NOT NULL DEFAULT 'disponible',
  descripcion TEXT,
  fecha_disponible DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on lotes table
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;

-- Users can only see their own lotes
CREATE POLICY "Users can view own lotes" 
  ON public.lotes 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own lotes
CREATE POLICY "Users can create own lotes" 
  ON public.lotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lotes
CREATE POLICY "Users can update own lotes" 
  ON public.lotes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own lotes
CREATE POLICY "Users can delete own lotes" 
  ON public.lotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger to update updated_at on lotes
CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on user queries
CREATE INDEX idx_lotes_user_id ON public.lotes(user_id);
CREATE INDEX idx_lotes_estado ON public.lotes(estado);
CREATE INDEX idx_lotes_tipo_residuo ON public.lotes(tipo_residuo);
