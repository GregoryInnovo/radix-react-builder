-- Remove the constraint that requires categories (will add validation in app instead)
-- This allows existing products to remain valid
ALTER TABLE public.productos 
DROP CONSTRAINT chk_productos_categorias;