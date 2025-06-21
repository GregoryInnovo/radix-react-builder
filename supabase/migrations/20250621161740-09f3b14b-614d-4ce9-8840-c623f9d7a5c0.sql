
-- Create products table
CREATE TABLE public.productos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagenes TEXT[] NOT NULL DEFAULT '{}', -- Array of image URLs
  disponible BOOLEAN NOT NULL DEFAULT true,
  origen_roa TEXT, -- Optional reference to the ROA source
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for products
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- Users can view all active products
CREATE POLICY "Anyone can view active products" 
  ON public.productos 
  FOR SELECT 
  USING (disponible = true);

-- Users can view their own products (including inactive ones)
CREATE POLICY "Users can view their own products" 
  ON public.productos 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own products
CREATE POLICY "Users can create their own products" 
  ON public.productos 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own products
CREATE POLICY "Users can update their own products" 
  ON public.productos 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can delete their own products
CREATE POLICY "Users can delete their own products" 
  ON public.productos 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
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

-- Add trigger to update updated_at column
CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON public.productos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
