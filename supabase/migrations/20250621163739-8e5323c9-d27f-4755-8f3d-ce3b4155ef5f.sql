
-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pendiente', 'aceptada', 'completada', 'cancelada');

-- Create enum for item type
CREATE TYPE public.item_type AS ENUM ('lote', 'producto');

-- Create orders table
CREATE TABLE public.ordenes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  solicitante_id UUID REFERENCES auth.users NOT NULL,
  proveedor_id UUID REFERENCES auth.users NOT NULL,
  tipo_item item_type NOT NULL,
  item_id UUID NOT NULL, -- References either lotes.id or productos.id
  cantidad_solicitada NUMERIC NOT NULL DEFAULT 1,
  fecha_propuesta_retiro DATE,
  estado order_status NOT NULL DEFAULT 'pendiente',
  mensaje_solicitud TEXT,
  mensaje_respuesta TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT cantidad_positiva CHECK (cantidad_solicitada > 0),
  CONSTRAINT usuarios_diferentes CHECK (solicitante_id != proveedor_id),
  CONSTRAINT fecha_futura CHECK (fecha_propuesta_retiro >= CURRENT_DATE)
);

-- Create unique constraint to prevent duplicate active orders
CREATE UNIQUE INDEX ordenes_activas_unicas 
ON public.ordenes (solicitante_id, proveedor_id, tipo_item, item_id) 
WHERE estado IN ('pendiente', 'aceptada');

-- Enable RLS
ALTER TABLE public.ordenes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can view orders where they are either requester or provider
CREATE POLICY "Users can view their own orders" 
  ON public.ordenes 
  FOR SELECT 
  USING (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);

-- Users can create orders as requesters
CREATE POLICY "Users can create orders as requesters" 
  ON public.ordenes 
  FOR INSERT 
  WITH CHECK (auth.uid() = solicitante_id);

-- Users can update orders where they are involved
CREATE POLICY "Users can update their orders" 
  ON public.ordenes 
  FOR UPDATE 
  USING (auth.uid() = solicitante_id OR auth.uid() = proveedor_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_ordenes_updated_at
  BEFORE UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create notifications table for in-app notifications
CREATE TABLE public.notificaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'orden', -- 'orden', 'general', etc.
  orden_id UUID REFERENCES public.ordenes,
  leida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notificaciones 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
  ON public.notificaciones 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to create notifications when order status changes
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify requester when provider responds
  IF OLD.estado = 'pendiente' AND NEW.estado IN ('aceptada', 'cancelada') THEN
    INSERT INTO public.notificaciones (user_id, titulo, mensaje, orden_id)
    VALUES (
      NEW.solicitante_id,
      CASE 
        WHEN NEW.estado = 'aceptada' THEN 'Orden Aceptada'
        ELSE 'Orden Cancelada'
      END,
      CASE 
        WHEN NEW.estado = 'aceptada' THEN 'Tu solicitud ha sido aceptada'
        ELSE 'Tu solicitud ha sido cancelada'
      END,
      NEW.id
    );
  END IF;
  
  -- Notify provider when new order is created
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notificaciones (user_id, titulo, mensaje, orden_id)
    VALUES (
      NEW.proveedor_id,
      'Nueva Solicitud',
      'Tienes una nueva solicitud de intercambio',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER notify_order_changes
  AFTER INSERT OR UPDATE ON public.ordenes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();
