import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface GuideImagesUploadProps {
  onImagesChange: (urls: string[]) => void;
  currentImages: string[];
}

export const GuideImagesUpload = ({ onImagesChange, currentImages }: GuideImagesUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate max 20 images total
    if (currentImages.length + files.length > 20) {
      toast({
        title: "Límite excedido",
        description: "Puedes subir máximo 20 imágenes en total",
        variant: "destructive",
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Archivo inválido",
          description: `${file.name} no es una imagen`,
          variant: "destructive",
        });
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Archivo muy grande",
          description: `${file.name} excede 5MB`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('guia-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('guia-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(publicUrl);
      }

      onImagesChange([...currentImages, ...uploadedUrls]);

      toast({
        title: "Imágenes subidas",
        description: `${uploadedUrls.length} imagen(es) subida(s) exitosamente`,
      });
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error al subir imágenes",
        description: error.message || "Intenta de nuevo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    try {
      const path = urlToRemove.split('/guia-images/')[1];
      if (path) {
        await supabase.storage.from('guia-images').remove([path]);
      }
      
      onImagesChange(currentImages.filter(url => url !== urlToRemove));
      
      toast({
        title: "Imagen eliminada",
        description: "La imagen ha sido eliminada exitosamente",
      });
    } catch (error: any) {
      console.error('Error removing image:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {currentImages.length}/20 imágenes
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading || currentImages.length >= 20}
          onClick={() => document.getElementById('guide-images-input')?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Subiendo...' : 'Agregar imágenes'}
        </Button>
        <input
          id="guide-images-input"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentImages.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(url)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {currentImages.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            No hay imágenes adjuntas
          </p>
        </div>
      )}
    </div>
  );
};