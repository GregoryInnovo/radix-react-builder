-- Add deleted_at column for soft delete
ALTER TABLE public.lotes ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Add index for performance
CREATE INDEX idx_lotes_deleted_at ON public.lotes(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policy to exclude deleted lotes from public view but allow access in orders
DROP POLICY IF EXISTS "Users can view own lotes, approved public ones, or admin sees a" ON public.lotes;

CREATE POLICY "Users can view own lotes, approved public ones, or admin sees all"
ON public.lotes
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  ((status = 'aprobado' AND estado = 'disponible' AND deleted_at IS NULL)) OR 
  is_current_user_admin() OR
  -- Allow viewing deleted lotes if they are referenced in user's orders
  (deleted_at IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.ordenes 
    WHERE ordenes.item_id = lotes.id 
    AND ordenes.tipo_item = 'lote'
    AND (ordenes.solicitante_id = auth.uid() OR ordenes.proveedor_id = auth.uid())
  ))
);