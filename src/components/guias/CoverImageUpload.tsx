import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CoverImageUploadProps {
  onImageChange: (url: string) => void;
  currentImage?: string;
}

export const CoverImageUpload = ({ onImageChange, currentImage }: CoverImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImage);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 5MB');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Debes iniciar sesión para subir imágenes');
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('guia-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('guia-images')
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onImageChange(publicUrl);
      toast.success('Imagen de portada subida exitosamente');
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast.error('Error al subir la imagen de portada');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    try {
      const urlParts = preview.split('/');
      const filePath = urlParts.slice(-2).join('/');
      
      await supabase.storage
        .from('guia-images')
        .remove([filePath]);

      setPreview(undefined);
      onImageChange('');
      toast.success('Imagen eliminada');
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      toast.error('Error al eliminar la imagen');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">
          Imagen de portada *
        </label>
        <p className="text-xs text-muted-foreground">
          Esta imagen se mostrará en la vista previa de la guía
        </p>
      </div>

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img 
            src={preview} 
            alt="Portada de la guía" 
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <input
            type="file"
            id="cover-image-upload"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label
            htmlFor="cover-image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Subiendo imagen...' : 'Click para seleccionar imagen de portada'}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG o WebP (máx. 5MB)
            </p>
          </label>
        </div>
      )}
    </div>
  );
};
