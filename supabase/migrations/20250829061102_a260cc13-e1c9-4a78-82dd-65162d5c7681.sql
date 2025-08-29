-- Add pricing fields to productos table
ALTER TABLE public.productos 
ADD COLUMN precio_unidad INTEGER,
ADD COLUMN incluye_domicilio BOOLEAN DEFAULT false,
ADD COLUMN direccion_vendedor TEXT,
ADD COLUMN costo_domicilio INTEGER DEFAULT 0;