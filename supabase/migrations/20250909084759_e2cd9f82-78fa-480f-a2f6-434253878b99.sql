-- Create table for tracking lote status history
CREATE TABLE public.lotes_historial (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lote_id UUID NOT NULL REFERENCES public.lotes(id) ON DELETE CASCADE,
  estado_anterior batch_status,
  estado_nuevo batch_status NOT NULL,
  usuario_accion_id UUID,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lotes_historial ENABLE ROW LEVEL SECURITY;

-- Create policies for lotes_historial
CREATE POLICY "Users can view history of accessible lotes" 
ON public.lotes_historial 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lotes 
    WHERE lotes.id = lotes_historial.lote_id 
    AND (lotes.user_id = auth.uid() OR lotes.status = 'aprobado' OR is_current_user_admin())
  )
);

CREATE POLICY "Admins can manage all history" 
ON public.lotes_historial 
FOR ALL 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

-- Create function to track status changes
CREATE OR REPLACE FUNCTION public.track_lote_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track if estado actually changed
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    INSERT INTO public.lotes_historial (
      lote_id,
      estado_anterior,
      estado_nuevo,
      usuario_accion_id
    ) VALUES (
      NEW.id,
      OLD.estado,
      NEW.estado,
      auth.uid()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic status tracking
CREATE TRIGGER trigger_track_lote_status_change
  AFTER UPDATE ON public.lotes
  FOR EACH ROW
  EXECUTE FUNCTION public.track_lote_status_change();

-- Add initial history record for existing lotes (creation)
INSERT INTO public.lotes_historial (lote_id, estado_anterior, estado_nuevo, created_at)
SELECT id, NULL, estado, created_at 
FROM public.lotes 
WHERE NOT EXISTS (
  SELECT 1 FROM public.lotes_historial WHERE lote_id = lotes.id
);

-- Update ordenes table to support lotes
ALTER TABLE public.ordenes ADD COLUMN IF NOT EXISTS modalidad_entrega TEXT;