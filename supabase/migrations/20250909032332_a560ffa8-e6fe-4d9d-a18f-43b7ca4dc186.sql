-- Create function to increment guide views
CREATE OR REPLACE FUNCTION public.increment_guia_views(guia_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.guias 
  SET vistas = vistas + 1, updated_at = now()
  WHERE id = guia_id AND activa = true;
END;
$$;