-- Crear bucket para imágenes de portada de guías
INSERT INTO storage.buckets (id, name, public)
VALUES ('guia-images', 'guia-images', true);

-- Permitir a usuarios autenticados subir imágenes de guías
CREATE POLICY "Authenticated users can upload guide images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guia-images');

-- Permitir a todos ver las imágenes de guías
CREATE POLICY "Anyone can view guide images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guia-images');

-- Permitir a usuarios autenticados eliminar sus imágenes de guías
CREATE POLICY "Authenticated users can delete their guide images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guia-images' AND auth.uid()::text = (storage.foldername(name))[1]);