import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Trash2, Upload, User } from 'lucide-react';
import { useAvatar } from '@/hooks/useAvatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string | null;
  userName: string;
  onAvatarChange?: (newUrl: string | null) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  userId,
  currentAvatarUrl,
  userName,
  onAvatarChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAvatar, deleteAvatar, uploading } = useAvatar();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentAvatarUrl || null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    const newUrl = await uploadAvatar(file, userId);
    if (newUrl && onAvatarChange) {
      onAvatarChange(newUrl);
    } else if (!newUrl) {
      // Revert preview if upload failed
      setPreviewUrl(currentAvatarUrl || null);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    const success = await deleteAvatar(userId);
    if (success) {
      setPreviewUrl(null);
      if (onAvatarChange) {
        onAvatarChange(null);
      }
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        {uploading ? (
          <Skeleton className="w-24 h-24 rounded-full" />
        ) : (
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={previewUrl || undefined} alt={userName} />
            <AvatarFallback className="bg-green-100 text-green-700 text-2xl font-bold">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Overlay on hover */}
        {!uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}>
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="sm"
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-2" />
          {previewUrl ? 'Cambiar foto' : 'Subir foto'}
        </Button>

        {previewUrl && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={uploading}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar foto de perfil?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Tu foto de perfil será eliminada permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-500 text-center">
        JPG, PNG o WEBP. Máximo 2MB.
      </p>
    </div>
  );
};
