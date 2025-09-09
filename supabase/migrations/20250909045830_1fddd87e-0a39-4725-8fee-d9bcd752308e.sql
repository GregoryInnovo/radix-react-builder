-- Add 'oculta' field to calificaciones table for admin moderation
ALTER TABLE public.calificaciones 
ADD COLUMN oculta BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies to handle the new 'oculta' field
DROP POLICY IF EXISTS "Users can view relevant ratings" ON public.calificaciones;

-- Create new policy that filters out hidden ratings for regular users
CREATE POLICY "Users can view relevant ratings" 
ON public.calificaciones 
FOR SELECT 
USING (
  (auth.uid() = calificador_id) OR 
  (auth.uid() = calificado_id) OR 
  (reportada = false AND oculta = false) OR
  is_current_user_admin()
);

-- Allow users to report ratings (update reportada field)
CREATE POLICY "Users can report ratings" 
ON public.calificaciones 
FOR UPDATE 
USING (
  auth.uid() != calificador_id AND 
  auth.uid() != calificado_id
) 
WITH CHECK (
  auth.uid() != calificador_id AND 
  auth.uid() != calificado_id
);

-- Allow admins to manage oculta and reportada fields
CREATE POLICY "Admins can manage rating visibility" 
ON public.calificaciones 
FOR UPDATE 
USING (is_current_user_admin()) 
WITH CHECK (is_current_user_admin());