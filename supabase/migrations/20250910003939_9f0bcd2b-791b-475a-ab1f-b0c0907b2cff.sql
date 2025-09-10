-- Add category fields to productos table
ALTER TABLE public.productos 
ADD COLUMN categoria_funcionalidad TEXT[] DEFAULT '{}',
ADD COLUMN categoria_tipo TEXT[] DEFAULT '{}';

-- Add indexes for better filter performance
CREATE INDEX idx_productos_categoria_funcionalidad ON public.productos USING GIN(categoria_funcionalidad);
CREATE INDEX idx_productos_categoria_tipo ON public.productos USING GIN(categoria_tipo);

-- Add constraint to ensure at least one category is selected for new products
ALTER TABLE public.productos 
ADD CONSTRAINT chk_productos_categorias 
CHECK (
  array_length(categoria_funcionalidad, 1) > 0 AND 
  array_length(categoria_tipo, 1) > 0
);