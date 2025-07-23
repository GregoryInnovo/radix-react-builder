
-- Add images field to lotes table
ALTER TABLE public.lotes ADD COLUMN imagenes TEXT[] NOT NULL DEFAULT '{}';

-- Create storage bucket for lote images if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lote-images',
  'lote-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lote images
CREATE POLICY "Anyone can view lote images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lote-images');

CREATE POLICY "Authenticated users can upload lote images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'lote-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own lote images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'lote-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own lote images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'lote-images' AND auth.uid()::text = (storage.foldername(name))[1]);
