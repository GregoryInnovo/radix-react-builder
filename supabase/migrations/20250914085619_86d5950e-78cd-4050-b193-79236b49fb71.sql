-- Add foreign keys for ordenes table to improve relationships
ALTER TABLE public.ordenes 
ADD CONSTRAINT ordenes_solicitante_id_fkey 
FOREIGN KEY (solicitante_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.ordenes 
ADD CONSTRAINT ordenes_proveedor_id_fkey 
FOREIGN KEY (proveedor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign keys for productos table
ALTER TABLE public.productos 
ADD CONSTRAINT productos_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign keys for lotes table  
ALTER TABLE public.lotes 
ADD CONSTRAINT lotes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign keys for other tables
ALTER TABLE public.calificaciones 
ADD CONSTRAINT calificaciones_calificador_id_fkey 
FOREIGN KEY (calificador_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.calificaciones 
ADD CONSTRAINT calificaciones_calificado_id_fkey 
FOREIGN KEY (calificado_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.orden_mensajes 
ADD CONSTRAINT orden_mensajes_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.orden_mensajes 
ADD CONSTRAINT orden_mensajes_orden_id_fkey 
FOREIGN KEY (orden_id) REFERENCES public.ordenes(id) ON DELETE CASCADE;