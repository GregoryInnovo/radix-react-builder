
-- Create enum types
CREATE TYPE public.roa_type AS ENUM (
  'cascara_fruta',
  'posos_cafe', 
  'restos_vegetales',
  'cascara_huevo',
  'restos_cereales',
  'otros'
);

CREATE TYPE public.batch_status AS ENUM (
  'disponible',
  'reservado', 
  'recogido',
  'cancelado'
);

CREATE TYPE public.order_status AS ENUM (
  'pendiente',
  'aceptada',
  'completada', 
  'cancelada'
);

CREATE TYPE public.item_type AS ENUM (
  'lote',
  'producto'
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  user_type TEXT CHECK (user_type IN ('generator', 'transformer', 'citizen', 'admin')) DEFAULT 'generator',
  phone TEXT,
  address TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create lotes (batches) table
CREATE TABLE public.lotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tipo_residuo public.roa_type NOT NULL,
  peso_estimado DECIMAL(8,2) NOT NULL CHECK (peso_estimado > 0),
  ubicacion_lat DECIMAL(10, 8) NOT NULL,
  ubicacion_lng DECIMAL(11, 8) NOT NULL,
  direccion TEXT,
  estado public.batch_status NOT NULL DEFAULT 'disponible',
  descripcion TEXT,
  fecha_disponible DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create productos table
CREATE TABLE public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagenes TEXT[] NOT NULL DEFAULT '{}',
  disponible BOOLEAN NOT NULL DEFAULT true,
  origen_roa TEXT,
  status TEXT DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.ordenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID REFERENCES auth.users NOT NULL,
  proveedor_id UUID REFERENCES auth.users NOT NULL,
  tipo_item item_type NOT NULL,
  item_id UUID NOT NULL,
  cantidad_solicitada NUMERIC NOT NULL DEFAULT 1,
  fecha_propuesta_retiro DATE,
  estado order_status NOT NULL DEFAULT 'pendiente',
  mensaje_solicitud TEXT,
  mensaje_respuesta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT cantidad_positiva CHECK (cantidad_solicitada > 0),
  CONSTRAINT usuarios_diferentes CHECK (solicitante_id != proveedor_id),
  CONSTRAINT fecha_futura CHECK (fecha_propuesta_retiro >= CURRENT_DATE)
);

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
  CONSTRAINT calificador_diferente_calificado CHECK (calificador_id != calificado_id),
  CONSTRAINT una_calificacion_por_orden UNIQUE (calificador_id, orden_id)
);

-- Create notifications table
CREATE TABLE public.notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'orden',
  orden_id UUID REFERENCES public.ordenes,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin audit table
CREATE TABLE public.auditoria_admin (
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  RETURN new;
END;
$$;

-- Security definer function to check if current user is admin
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

-- Functions for user ratings
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

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_admin ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id OR is_active = true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    id = auth.uid() OR 
    public.is_current_user_admin()
  );

CREATE POLICY "Admins can update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- RLS Policies for lotes
CREATE POLICY "Users can view own lotes, approved public ones, or admin sees all" 
  ON public.lotes 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (status = 'aprobado' AND estado = 'disponible') OR
    public.is_current_user_admin()
  );

CREATE POLICY "Users can create own lotes" 
  ON public.lotes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lotes" 
  ON public.lotes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lotes" 
  ON public.lotes 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update lote status" 
  ON public.lotes 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- RLS Policies for productos
CREATE POLICY "Users can view approved products or admin sees all" 
  ON public.productos 
  FOR SELECT 
  USING (
    (disponible = true AND status = 'aprobado') OR 
    auth.uid() = user_id OR 
    public.is_current_user_admin()
  );

CREATE POLICY "Users can create their own products" 
  ON public.productos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
  ON public.productos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
  ON public.productos 
  FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update product status" 
  ON public.productos 
  FOR UPDATE 
  USING (public.is_current_user_admin());

-- RLS Policies for ordenes
CREATE POLICY "Users can view their own orders" 
  ON public.ordenes 
  FOR SELECT 
  USING (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);

CREATE POLICY "Users can create orders as requesters" 
  ON public.ordenes 
  FOR INSERT 
  WITH CHECK (auth.uid() = solicitante_id);

CREATE POLICY "Users can update their orders" 
  ON public.ordenes 
  FOR UPDATE 
  USING (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);

CREATE POLICY "Admins can view all orders" 
  ON public.ordenes 
  FOR SELECT 
  USING (
    solicitante_id = auth.uid() OR 
    proveedor_id = auth.uid() OR
    public.is_current_user_admin()
  );

-- RLS Policies for calificaciones
CREATE POLICY "Users can view relevant ratings" 
  ON public.calificaciones 
  FOR SELECT 
  USING (
    (auth.uid() = calificador_id OR auth.uid() = calificado_id OR reportada = false)
  );

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

CREATE POLICY "Users can update their own ratings" 
  ON public.calificaciones 
  FOR UPDATE 
  USING (auth.uid() = calificador_id);

CREATE POLICY "Users can delete their own ratings" 
  ON public.calificaciones 
  FOR DELETE 
  USING (auth.uid() = calificador_id);

CREATE POLICY "Admins can view all ratings" 
  ON public.calificaciones 
  FOR SELECT 
  USING (
    calificador_id = auth.uid() OR 
    calificado_id = auth.uid() OR
    public.is_current_user_admin()
  );

-- RLS Policies for notificaciones
CREATE POLICY "Users can view their own notifications" 
  ON public.notificaciones 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notificaciones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for auditoria_admin
CREATE POLICY "Only admins can access audit logs" 
  ON public.auditoria_admin 
  FOR ALL 
  USING (public.is_current_user_admin());

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lotes_updated_at
  BEFORE UPDATE ON public.lotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calificaciones_updated_at
  BEFORE UPDATE ON public.calificaciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_lotes_user_id ON public.lotes(user_id);
CREATE INDEX idx_lotes_estado ON public.lotes(estado);
CREATE INDEX idx_lotes_tipo_residuo ON public.lotes(tipo_residuo);

CREATE UNIQUE INDEX ordenes_activas_unicas 
ON public.ordenes (solicitante_id, proveedor_id, tipo_item, item_id) 
WHERE estado IN ('pendiente', 'aceptada');

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies for product images
CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);
