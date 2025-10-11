import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductImageGallery } from '@/components/productos/ProductImageGallery';
import { supabase } from '@/integrations/supabase/client';
import { useGuiasGuardadas } from '@/hooks/useGuiasGuardadas';
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Bookmark, 
  BookmarkCheck,
  Share2,
  ExternalLink,
  Calendar,
  Images
} from 'lucide-react';
import { Guia } from '@/hooks/useGuias';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function GuiaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isGuardada, toggleGuardada, isToggling } = useGuiasGuardadas();
  const [showImageGallery, setShowImageGallery] = useState(false);

  const { data: guia, isLoading, error } = useQuery({
    queryKey: ['guia', id],
    queryFn: async () => {
      if (!id) throw new Error('ID de guía requerido');
      
      const { data, error } = await supabase
        .from('guias')
        .select('*')
        .eq('id', id)
        .eq('activa', true)
        .single();

      if (error) throw error;
      return data as Guia;
    },
    enabled: !!id,
  });

  // Increment views when component mounts
  useEffect(() => {
    if (guia?.id) {
      // Simple implementation without SQL functions for now
      supabase
        .from('guias')
        .select('vistas')
        .eq('id', guia.id)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('guias')
              .update({ vistas: data.vistas + 1 })
              .eq('id', guia.id);
          }
        });
    }
  }, [guia?.id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: guia?.titulo,
          text: guia?.descripcion,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !guia) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Guía no encontrada</h1>
            <p className="text-muted-foreground mb-6">
              La guía que buscas no existe o ha sido removida.
            </p>
            <Button onClick={() => navigate('/guias')}>
              Volver a Guías
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const categoryColors = {
    compostaje: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    reciclaje: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    reduccion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    reutilizacion: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    sostenibilidad: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  };


  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/guias')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Guías
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge className={categoryColors[guia.categoria]}>
              {guia.categoria}
            </Badge>
            {guia.destacada && (
              <Badge variant="default" className="bg-primary">
                ⭐ Destacada
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{guia.titulo}</h1>
          <p className="text-lg text-muted-foreground mb-6">{guia.descripcion}</p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
            {guia.tiempo_lectura && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{guia.tiempo_lectura} min de lectura</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{guia.vistas} vistas</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(guia.created_at), 'dd MMM yyyy', { locale: es })}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => toggleGuardada(guia.id)}
              disabled={isToggling}
              className="gap-2"
            >
              {isGuardada(guia.id) ? (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  Guardada
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  Guardar
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="w-4 h-4" />
              Compartir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Images Button - Only show if there are attached images */}
            {guia.imagenes && guia.imagenes.length > 0 && (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowImageGallery(true)}
              >
                <Images className="w-4 h-4" />
                Ver imágenes ({guia.imagenes.length})
              </Button>
            )}

            {/* Content */}
            <Card>
              <CardContent className="p-6">
                <div 
                  className="prose prose-gray dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: guia.contenido.replace(/\n/g, '<br>') }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Autor</h3>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback>NT</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Equipo Natuvital</p>
                    <p className="text-sm text-muted-foreground">
                      Expertos en sostenibilidad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {guia.tags && guia.tags.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {guia.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Link */}
            {guia.video_url && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Video Tutorial</h3>
                  <Button 
                    className="w-full gap-2"
                    onClick={() => window.open(guia.video_url!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver en plataforma externa
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Acciones rápidas</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => window.print()}
                  >
                    📄 Imprimir guía
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir en redes
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link to="/guias">
                      🔍 Explorar más guías
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Image Gallery Modal */}
        {guia.imagenes && guia.imagenes.length > 0 && (
          <ProductImageGallery
            isOpen={showImageGallery}
            onClose={() => setShowImageGallery(false)}
            images={guia.imagenes}
            productTitle={guia.titulo}
          />
        )}
      </main>
    </div>
  );
}