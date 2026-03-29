-- Add DELETE policy for admins on productos table
-- Previously only product owners could delete (auth.uid() = user_id)
-- This allows admins to delete any product
CREATE POLICY "Admins can delete any product"
  ON public.productos
  FOR DELETE
  USING (public.is_current_user_admin());

-- Add DELETE policy for admins on lotes table (for consistency)
CREATE POLICY "Admins can delete any lote"
  ON public.lotes
  FOR DELETE
  USING (public.is_current_user_admin());

-- Fix FK constraint on calificaciones to cascade on product deletion
ALTER TABLE public.calificaciones
  DROP CONSTRAINT calificaciones_producto_id_fkey,
  ADD CONSTRAINT calificaciones_producto_id_fkey
    FOREIGN KEY (producto_id)
    REFERENCES public.productos(id)
    ON DELETE CASCADE;
