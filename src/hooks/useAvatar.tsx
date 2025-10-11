import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAvatar = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    setUploading(true);
    try {
      // Validate file size (2MB max)
      if (file.size > 2097152) {
        toast({
          title: "Error",
          description: "La imagen no puede superar los 2MB",
          variant: "destructive",
        });
        return null;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: "Error",
          description: "Solo se permiten imágenes JPG, PNG o WEBP",
          variant: "destructive",
        });
        return null;
      }

      // Generate file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${existingFiles[0].name}`]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast({
        title: "¡Éxito!",
        description: "Foto de perfil actualizada correctamente",
      });

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (userId: string): Promise<boolean> => {
    try {
      // Delete from storage
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (files && files.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${files[0].name}`]);
      }

      // Update profile to remove avatar URL
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Foto eliminada",
        description: "Tu foto de perfil ha sido eliminada",
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      });
      return false;
    }
  };

  return { uploadAvatar, deleteAvatar, uploading };
};
