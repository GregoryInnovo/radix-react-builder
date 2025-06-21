
-- Create ratings table
CREATE TABLE public.calificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calificador_id UUID REFERENCES auth.users NOT NULL,
  calificado_id UUID REFERENCES auth.users NOT NULL,
  orden_id UUID REFERENCES public.ordenes NOT NULL,
  producto_id UUID REFERENCES public.productos,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  reportada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT calificador_diferente_calificado CHECK (calificador_id != calificado_id),
  CONSTRAINT una_calificacion_por_orden UNIQUE (calificador_id, orden_id)
);

-- Enable RLS
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ratings
-- Users can view ratings they made or received (not reported ones)
CREATE POLICY "Users can view relevant ratings" 
  ON public.calificaciones 
  FOR SELECT 
  USING (
    (auth.uid() = calificador_id OR auth.uid() = calificado_id OR reportada = false)
  );

-- Users can create ratings for completed orders they participated in
CREATE POLICY "Users can create ratings for their completed orders" 
  ON public.calificaciones 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = calificador_id AND
    EXISTS (
      SELECT 1 FROM public.ordenes 
      WHERE id = orden_id 
      AND estado = 'completada' 
      AND (solicitante_id = auth.uid() OR proveedor_id = auth.uid())
    )
  );

-- Users can update their own ratings (only reportada flag for now)
CREATE POLICY "Users can update their own ratings" 
  ON public.calificaciones 
  FOR UPDATE 
  USING (auth.uid() = calificador_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete their own ratings" 
  ON public.calificaciones 
  FOR DELETE 
  USING (auth.uid() = calificador_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_calificaciones_updated_at
  BEFORE UPDATE ON public.calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate user average rating
CREATE OR REPLACE FUNCTION public.get_user_average_rating(user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT ROUND(AVG(puntuacion), 1)
    FROM public.calificaciones
    WHERE calificado_id = user_id 
    AND reportada = false
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get user rating count
CREATE OR REPLACE FUNCTION public.get_user_rating_count(user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER
    FROM public.calificaciones
    WHERE calificado_id = user_id 
    AND reportada = false
  );
END;
$$ LANGUAGE plpgsql STABLE;
