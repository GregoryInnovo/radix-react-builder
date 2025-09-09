-- Create guias table
CREATE TABLE public.guias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'articulo', 'infografia')),
  categoria TEXT NOT NULL CHECK (categoria IN ('compostaje', 'reciclaje', 'reduccion', 'reutilizacion', 'sostenibilidad')),
  portada_url TEXT,
  video_url TEXT,
  imagenes TEXT[] DEFAULT '{}',
  autor_id UUID NOT NULL,
  tags TEXT[] DEFAULT '{}',
  tiempo_lectura INTEGER, -- en minutos
  nivel TEXT NOT NULL DEFAULT 'principiante' CHECK (nivel IN ('principiante', 'intermedio', 'avanzado')),
  activa BOOLEAN NOT NULL DEFAULT true,
  destacada BOOLEAN NOT NULL DEFAULT false,
  vistas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guias_guardadas table
CREATE TABLE public.guias_guardadas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  guia_id UUID NOT NULL REFERENCES public.guias(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, guia_id)
);

-- Enable RLS
ALTER TABLE public.guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_guardadas ENABLE ROW LEVEL SECURITY;

-- RLS policies for guias
CREATE POLICY "Anyone can view active guides" 
ON public.guias 
FOR SELECT 
USING (activa = true);

CREATE POLICY "Admins can manage guides" 
ON public.guias 
FOR ALL 
USING (is_current_user_admin());

-- RLS policies for guias_guardadas
CREATE POLICY "Users can view their saved guides" 
ON public.guias_guardadas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can save guides" 
ON public.guias_guardadas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved guides" 
ON public.guias_guardadas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_guias_updated_at
BEFORE UPDATE ON public.guias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.guias (titulo, descripcion, contenido, tipo, categoria, portada_url, autor_id, tags, tiempo_lectura, nivel, destacada) VALUES
('Compostaje en Casa: Guía Completa', 'Aprende a crear compost casero paso a paso', 'El compostaje es una forma natural de reciclar residuos orgánicos...', 'articulo', 'compostaje', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['compost', 'organico', 'casa'], 10, 'principiante', true),
('Separación de Residuos: Lo Básico', 'Todo lo que necesitas saber sobre separación', 'La separación correcta de residuos es fundamental...', 'infografia', 'reciclaje', 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['separacion', 'basura', 'reciclar'], 5, 'principiante', true),
('Reducir Plástico en el Hogar', 'Estrategias prácticas para menos plástico', 'El plástico está en todas partes, pero podemos reducir su uso...', 'video', 'reduccion', 'https://images.unsplash.com/photo-1621451537084-482d73073a0f?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['plastico', 'hogar', 'reducir'], 8, 'principiante', false),
('Reutilizar Envases de Vidrio', 'Ideas creativas para dar nueva vida', 'Los envases de vidrio tienen múltiples usos...', 'articulo', 'reutilizacion', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['vidrio', 'envases', 'creatividad'], 6, 'intermedio', false),
('Vida Sostenible: Primeros Pasos', 'Introducción a un estilo de vida eco-friendly', 'Adoptar un estilo de vida sostenible no tiene que ser complicado...', 'video', 'sostenibilidad', 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['sostenible', 'estilo', 'vida'], 12, 'principiante', true),
('Compost con Lombrices', 'Vermicompostaje para principiantes', 'El vermicompostaje es una técnica avanzada...', 'articulo', 'compostaje', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400', (SELECT id FROM profiles WHERE is_admin = true LIMIT 1), ARRAY['lombrices', 'vermi', 'compost'], 15, 'intermedio', false);