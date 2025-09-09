-- Create table for order messages
CREATE TABLE public.orden_mensajes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  mensaje TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orden_mensajes ENABLE ROW LEVEL SECURITY;

-- Create policies for order messages
CREATE POLICY "Users can view messages from their orders" 
ON public.orden_mensajes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.ordenes 
    WHERE ordenes.id = orden_mensajes.orden_id 
    AND (ordenes.solicitante_id = auth.uid() OR ordenes.proveedor_id = auth.uid())
  )
);

CREATE POLICY "Users can create messages in their orders" 
ON public.orden_mensajes 
FOR INSERT 
WITH CHECK (
  auth.uid() = usuario_id AND
  EXISTS (
    SELECT 1 FROM public.ordenes 
    WHERE ordenes.id = orden_mensajes.orden_id 
    AND (ordenes.solicitante_id = auth.uid() OR ordenes.proveedor_id = auth.uid())
    AND ordenes.estado IN ('pendiente', 'aceptada')
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.orden_mensajes 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own messages" 
ON public.orden_mensajes 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages" 
ON public.orden_mensajes 
FOR ALL 
USING (is_current_user_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_orden_mensajes_updated_at
BEFORE UPDATE ON public.orden_mensajes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_orden_mensajes_orden_id ON public.orden_mensajes(orden_id);
CREATE INDEX idx_orden_mensajes_created_at ON public.orden_mensajes(created_at);