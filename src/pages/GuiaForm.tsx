import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGuias, GuiaCategoria } from '@/hooks/useGuias';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Eye } from 'lucide-react';
import { CoverImageUpload } from '@/components/guias/CoverImageUpload';
import { GuideImagesUpload } from '@/components/guias/GuideImagesUpload';
import { ProductImageGallery } from '@/components/productos/ProductImageGallery';
import { toast } from 'sonner';

export default function GuiaForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createGuia, isCreating } = useGuias();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    categoria: '' as GuiaCategoria | '',
    portada_url: '',
    video_url: '',
    imagenes: [] as string[],
  });
  const [showImageViewer, setShowImageViewer] = useState(false);

  const categoriaOptions: { value: GuiaCategoria; label: string; icon: string }[] = [
    { value: 'sabias_que', label: '¿Sabías que...?', icon: '🧠' },
    { value: 'reutilizacion_aprovechamiento', label: 'Reutilización y aprovechamiento', icon: '♻️' },
    { value: 'manuales_tecnicos', label: 'Manuales técnicos / operativos', icon: '🧾' },
    { value: 'salud_bienestar', label: 'Salud y bienestar natural', icon: '🌿' },
    { value: 'impacto_sostenibilidad', label: 'Impacto y sostenibilidad local', icon: '🌎' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión para crear una guía');
      return;
    }

    if (!formData.categoria) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    if (!formData.portada_url) {
      toast.error('Por favor sube una imagen de portada');
      return;
    }

    const newGuia = {
      ...formData,
      categoria: formData.categoria as GuiaCategoria,
      autor_id: user.id,
      tipo: 'articulo' as const,
      nivel: 'principiante' as const,
      tags: [],
      tiempo_lectura: null,
      destacada: false,
      activa: true,
      vistas: 0,
    };

    createGuia(newGuia);
    navigate('/guias');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/guias')}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Guías
            </Button>
            
            <h1 className="text-3xl font-bold">Nueva Guía</h1>
            <p className="text-muted-foreground">
              Crea una nueva guía para la comunidad
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 max-w-2xl">
              {/* Información básica */}
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Título *
                    </label>
                    <Input
                      value={formData.titulo}
                      onChange={(e) => handleInputChange('titulo', e.target.value)}
                      placeholder="Escribe un título atractivo..."
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Descripción *
                    </label>
                    <Textarea
                      value={formData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      placeholder="Describe brevemente de qué trata la guía..."
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Contenido *
                    </label>
                    <Textarea
                      value={formData.contenido}
                      onChange={(e) => handleInputChange('contenido', e.target.value)}
                      placeholder="Escribe el contenido completo de la guía..."
                      rows={12}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categoría */}
              <Card>
                <CardHeader>
                  <CardTitle>Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Categoría *
                    </label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => handleInputChange('categoria', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Multimedia */}
              <Card>
                <CardHeader>
                  <CardTitle>Multimedia</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Foto de portada (requerida)
                    </label>
                    <CoverImageUpload
                      currentImage={formData.portada_url}
                      onImageChange={(url) => handleInputChange('portada_url', url)}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Imágenes adjuntas (opcional)
                      </label>
                      {formData.imagenes.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowImageViewer(true)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Ver imágenes
                        </Button>
                      )}
                    </div>
                    <GuideImagesUpload
                      onImagesChange={(urls) => handleInputChange('imagenes', urls)}
                      currentImages={formData.imagenes}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Puedes agregar hasta 20 imágenes adicionales (máx. 5MB cada una)
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      URL de video (opcional)
                    </label>
                    <Input
                      value={formData.video_url}
                      onChange={(e) => handleInputChange('video_url', e.target.value)}
                      placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                      type="url"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Pega el enlace de un video de YouTube, Vimeo u otra plataforma
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/guias')}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Guía'}
              </Button>
            </div>
          </form>

          {/* Image Viewer Modal */}
          {showImageViewer && (
            <ProductImageGallery
              isOpen={showImageViewer}
              onClose={() => setShowImageViewer(false)}
              images={formData.imagenes}
              productTitle={formData.titulo || 'Imágenes de la guía'}
            />
          )}
        </div>
      </main>
    </div>
  );
}