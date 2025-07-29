import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';

interface LoteImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  loteTitle: string;
}

export const LoteImageGallery: React.FC<LoteImageGalleryProps> = ({
  isOpen,
  onClose,
  images,
  loteTitle,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lote-${loteTitle}-imagen-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle>Imágenes del Lote - {loteTitle}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 relative flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
          {/* Imagen principal */}
          <img
            src={images[currentImageIndex]}
            alt={`${loteTitle} - Imagen ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          
          {/* Navegación anterior/siguiente */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          
          {/* Contador de imágenes */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
          
          {/* Botón de descarga */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white"
            onClick={() => handleDownload(images[currentImageIndex], currentImageIndex)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto py-2 max-h-24">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-green-500 opacity-100'
                    : 'border-gray-300 opacity-70 hover:opacity-100'
                }`}
                onClick={() => setCurrentImageIndex(index)}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Botón cerrar */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};