
-- Add is_admin field to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add status fields to existing tables for moderation
ALTER TABLE public.lotes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';
ALTER TABLE public.productos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';

-- Create simple admin audit table
CREATE TABLE IF NOT EXISTS public.auditoria_admin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.auditoria_admin ENABLE ROW LEVEL SECURITY;

-- RLS policy for admin audit - only admins can view and insert
CREATE POLICY "Only admins can access audit logs" 
  ON public.auditoria_admin 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Update existing RLS policies to allow admin access
-- Update lotes policy to allow admin to see all lotes
DROP POLICY IF EXISTS "Users can view own lotes or public available" ON public.lotes;
CREATE POLICY "Users can view own lotes, approved public ones, or admin sees all" 
  ON public.lotes 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (status = 'aprobado' AND estado = 'disponible') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Update productos policy to allow admin to see all products
DROP POLICY IF EXISTS "Users can view available products" ON public.productos;
CREATE POLICY "Users can view approved products or admin sees all" 
  ON public.productos 
  FOR SELECT 
  USING (
    (disponible = true AND status = 'aprobado') OR 
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to update status of lotes and productos
CREATE POLICY "Admins can update lote status" 
  ON public.lotes 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can update product status" 
  ON public.productos 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to update user status  
CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- Allow admins to view all calificaciones
CREATE POLICY "Admins can view all ratings" 
  ON public.calificaciones 
  FOR SELECT 
  USING (
    calificador_id = auth.uid() OR 
    calificado_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Allow admins to view all ordenes
CREATE POLICY "Admins can view all orders" 
  ON public.ordenes 
  FOR SELECT 
  USING (
    solicitante_id = auth.uid() OR 
    proveedor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Note: To make a user admin, manually run this SQL in Supabase dashboard:
-- UPDATE public.profiles SET is_admin = true WHERE email = 'admin@natuvital.com';
