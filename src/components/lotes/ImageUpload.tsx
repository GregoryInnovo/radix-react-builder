
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  disabled?: boolean;
}

export const ImageUpload = ({ images, onImagesChange, disabled }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File) => {
    if (!file) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${Math.random()}/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('lote-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('lote-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(file => uploadImage(file));
    const uploadedUrls = await Promise.all(uploadPromises);
    
    const validUrls = uploadedUrls.filter(url => url !== null) as string[];
    
    if (validUrls.length > 0) {
      onImagesChange([...images, ...validUrls]);
      toast({
        title: "Imágenes subidas",
        description: `Se subieron ${validUrls.length} imagen(es) exitosamente`,
      });
    }
  };

  const removeImage = async (imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      const filePath = `${folderName}/${fileName}`;

      await supabase.storage
        .from('lote-images')
        .remove([filePath]);

      onImagesChange(images.filter(img => img !== imageUrl));
      
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada exitosamente",
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: "Error al eliminar imagen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="images">Imágenes del Lote</Label>
        <div className="mt-2">
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative overflow-hidden">
              <img
                src={imageUrl}
                alt={`Imagen ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeImage(imageUrl)}
                  disabled={disabled}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                  Principal
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <Card className="border-dashed border-2 border-gray-300 p-6">
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {uploading ? 'Subiendo imágenes...' : 'No hay imágenes seleccionadas'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sube imágenes para mostrar tu lote (JPG, PNG, WebP)
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
