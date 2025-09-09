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
import { Badge } from '@/components/ui/badge';
import { useGuias, GuiaCategoria, GuiaType, GuiaNivel } from '@/hooks/useGuias';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, X, Plus } from 'lucide-react';

export default function GuiaForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createGuia, isCreating } = useGuias();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: '' as GuiaType,
    categoria: '' as GuiaCategoria,
    nivel: 'principiante' as GuiaNivel,
    portada_url: '',
    video_url: '',
    tiempo_lectura: '',
    destacada: false,
  });

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [currentImagen, setCurrentImagen] = useState('');

  const categoriaOptions = [
    { value: 'compostaje', label: 'Compostaje' },
    { value: 'reciclaje', label: 'Reciclaje' },
    { value: 'reduccion', label: 'Reducción' },
    { value: 'reutilizacion', label: 'Reutilización' },
    { value: 'sostenibilidad', label: 'Sostenibilidad' },
  ];

  const tipoOptions = [
    { value: 'video', label: 'Video' },
    { value: 'articulo', label: 'Artículo' },
    { value: 'infografia', label: 'Infografía' },
  ];

  const nivelOptions = [
    { value: 'principiante', label: 'Principiante' },
    { value: 'intermedio', label: 'Intermedio' },
    { value: 'avanzado', label: 'Avanzado' },
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const addImagen = () => {
    if (currentImagen.trim() && !imagenes.includes(currentImagen.trim())) {
      setImagenes(prev => [...prev, currentImagen.trim()]);
      setCurrentImagen('');
    }
  };

  const removeImagen = (imagenToRemove: string) => {
    setImagenes(prev => prev.filter(imagen => imagen !== imagenToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;

    const newGuia = {
      ...formData,
      autor_id: user.id,
      tags,
      imagenes,
      tiempo_lectura: formData.tiempo_lectura ? parseInt(formData.tiempo_lectura) : null,
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
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

                <Card>
                  <CardHeader>
                    <CardTitle>Multimedia</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        URL de imagen de portada
                      </label>
                      <Input
                        value={formData.portada_url}
                        onChange={(e) => handleInputChange('portada_url', e.target.value)}
                        placeholder="https://example.com/imagen.jpg"
                        type="url"
                      />
                    </div>

                    {formData.tipo === 'video' && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          URL del video
                        </label>
                        <Input
                          value={formData.video_url}
                          onChange={(e) => handleInputChange('video_url', e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          type="url"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Imágenes adicionales
                      </label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={currentImagen}
                          onChange={(e) => setCurrentImagen(e.target.value)}
                          placeholder="URL de imagen adicional"
                          type="url"
                        />
                        <Button type="button" onClick={addImagen} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {imagenes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {imagenes.map((imagen, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                              Imagen {index + 1}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 ml-1"
                                onClick={() => removeImagen(imagen)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Categorización</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tipo *
                      </label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => handleInputChange('tipo', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Nivel
                      </label>
                      <Select
                        value={formData.nivel}
                        onValueChange={(value) => handleInputChange('nivel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {nivelOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Tiempo de lectura (minutos)
                      </label>
                      <Input
                        value={formData.tiempo_lectura}
                        onChange={(e) => handleInputChange('tiempo_lectura', e.target.value)}
                        placeholder="15"
                        type="number"
                        min="1"
                        max="120"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        placeholder="Agregar tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
                              onClick={() => removeTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Opciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.destacada}
                        onChange={(e) => handleInputChange('destacada', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">Marcar como destacada</span>
                    </label>
                  </CardContent>
                </Card>
              </div>
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
        </div>
      </main>
    </div>
  );
}