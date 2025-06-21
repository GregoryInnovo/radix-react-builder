
-- Create a security definer function to check if current user is admin
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Update all RLS policies to use the security definer function instead of direct queries

-- Drop and recreate lotes policy
DROP POLICY IF EXISTS "Users can view own lotes, approved public ones, or admin sees all" ON public.lotes;
CREATE POLICY "Users can view own lotes, approved public ones, or admin sees all" 
  ON public.lotes 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (status = 'aprobado' AND estado = 'disponible') OR
    public.is_current_user_admin()
  );

-- Drop and recreate productos policy
DROP POLICY IF EXISTS "Users can view approved products or admin sees all" ON public.productos;
CREATE POLICY "Users can view approved products or admin sees all" 
  ON public.productos 
  FOR SELECT 
  USING (
    (disponible = true AND status = 'aprobado') OR 
    auth.uid() = user_id OR 
    public.is_current_user_admin()
  );

-- Drop and recreate admin update policies
DROP POLICY IF EXISTS "Admins can update lote status" ON public.lotes;
CREATE POLICY "Admins can update lote status" 
  ON public.lotes 
  FOR UPDATE 
  USING (public.is_current_user_admin());

DROP POLICY IF EXISTS "Admins can update product status" ON public.productos;
CREATE POLICY "Admins can update product status" 
  ON public.productos 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- Drop and recreate profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    public.is_current_user_admin()
  );

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- Drop and recreate calificaciones policy
DROP POLICY IF EXISTS "Admins can view all ratings" ON public.calificaciones;
CREATE POLICY "Admins can view all ratings" 
  ON public.calificaciones 
  FOR SELECT 
  USING (
    calificador_id = auth.uid() OR 
    calificado_id = auth.uid() OR
    public.is_current_user_admin()
  );

-- Drop and recreate ordenes policy
DROP POLICY IF EXISTS "Admins can view all orders" ON public.ordenes;
CREATE POLICY "Admins can view all orders" 
  ON public.ordenes 
  FOR SELECT 
  USING (
    solicitante_id = auth.uid() OR 
    proveedor_id = auth.uid() OR
    public.is_current_user_admin()
  );

-- Update audit policy
DROP POLICY IF EXISTS "Only admins can access audit logs" ON public.auditoria_admin;
CREATE POLICY "Only admins can access audit logs" 
  ON public.auditoria_admin 
  FOR ALL 
  USING (public.is_current_user_admin());
