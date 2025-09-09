-- Update RLS policies for calificaciones to allow admin actions
DROP POLICY IF EXISTS "Admins can manage rating visibility" ON public.calificaciones;

-- Create comprehensive admin policy for all operations
CREATE POLICY "Admins can manage all ratings" 
ON public.calificaciones 
FOR ALL 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());