import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Clock, 
  Play, 
  Image as ImageIcon, 
  FileText, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Guia } from '@/hooks/useGuias';
import { useGuiasGuardadas } from '@/hooks/useGuiasGuardadas';
import { Link } from 'react-router-dom';

interface GuiaCardProps {
  guia: Guia;
  showAuthor?: boolean;
}

const typeIcons = {
  video: Play,
  articulo: FileText,
  infografia: ImageIcon,
};

const categoryColors = {
  sabias_que: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  reutilizacion_aprovechamiento: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  manuales_tecnicos: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  salud_bienestar: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
  impacto_sostenibilidad: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
};


export const GuiaCard = ({ guia, showAuthor = false }: GuiaCardProps) => {
  const { isGuardada, toggleGuardada, isToggling } = useGuiasGuardadas();
  const [imageError, setImageError] = useState(false);
  
  const TypeIcon = typeIcons[guia.tipo];
  const isVideoGuia = guia.tipo === 'video';
  const hasMultipleImages = guia.imagenes && guia.imagenes.length > 1;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: guia.titulo,
          text: guia.descripcion,
          url: `${window.location.origin}/guias/${guia.id}`,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/guias/${guia.id}`);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleGuardada(guia.id);
  };

  return (
    <Link to={`/guias/${guia.id}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-video overflow-hidden bg-muted">
          {!imageError && guia.portada_url ? (
            <img
              src={guia.portada_url}
              alt={guia.titulo}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
              <TypeIcon className="w-12 h-12 text-primary/60" />
            </div>
          )}
          
          {/* Overlay Indicators */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            <Badge 
              variant="secondary" 
              className={`${categoryColors[guia.categoria]} text-xs font-medium`}
            >
              {guia.categoria}
            </Badge>
            {guia.destacada && (
              <Badge variant="default" className="text-xs bg-primary">
                ⭐ Destacada
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            {isVideoGuia && (
              <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                <Play className="w-3 h-3 mr-1" />
                Video
              </Badge>
            )}
            {hasMultipleImages && (
              <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                <ImageIcon className="w-3 h-3 mr-1" />
                {guia.imagenes.length}
              </Badge>
            )}
          </div>

          {/* Action Buttons Overlay */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
              onClick={handleBookmark}
              disabled={isToggling}
            >
              {isGuardada(guia.id) ? (
                <BookmarkCheck className="w-4 h-4 text-primary" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Title and Description */}
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                {guia.titulo}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {guia.descripcion}
              </p>
            </div>

            {/* Tags */}
            {guia.tags && guia.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {guia.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {guia.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{guia.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {guia.tiempo_lectura && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{guia.tiempo_lectura} min</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{guia.vistas}</span>
              </div>
            </div>

            {/* Author Info */}
            {showAuthor && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">NA</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  Natuvital Team
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};