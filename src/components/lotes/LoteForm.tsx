
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ImageUpload } from './ImageUpload';
import { useTiposResiduo } from '@/hooks/useTiposResiduo';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface LoteFormProps {
  lote?: Lote;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

export const LoteForm = ({ lote, onSubmit, loading, onCancel }: LoteFormProps) => {
  const { tiposResiduos, loading: loadingTipos } = useTiposResiduo();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    titulo: lote?.titulo || '',
    tipo_residuo_id: lote?.tipo_residuo_id || '',
    peso_estimado: lote?.peso_estimado?.toString() || '',
    ubicacion_lat: lote?.ubicacion_lat?.toString() || '',
    ubicacion_lng: lote?.ubicacion_lng?.toString() || '',
    direccion: lote?.direccion || '',
    descripcion: lote?.descripcion || '',
    fecha_vencimiento: lote?.fecha_vencimiento || '',
    imagenes: lote?.imagenes || [],
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  // Establecer los datos del lote al cargar
  useEffect(() => {
    if (lote) {
      setFormData({
        titulo: lote.titulo || '',
        tipo_residuo_id: lote.tipo_residuo_id || '',
        peso_estimado: lote.peso_estimado?.toString() || '',
        ubicacion_lat: lote.ubicacion_lat?.toString() || '',
        ubicacion_lng: lote.ubicacion_lng?.toString() || '',
        direccion: lote.direccion || '',
        descripcion: lote.descripcion || '',
        fecha_vencimiento: lote.fecha_vencimiento || '',
        imagenes: lote.imagenes || [],
      });
    }
  }, [lote]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({ ...prev, imagenes: images }));
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no disponible",
        description: "Tu navegador no soporta geolocalización",
        variant: "destructive",
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          ubicacion_lat: position.coords.latitude.toString(),
          ubicacion_lng: position.coords.longitude.toString(),
        }));
        setGettingLocation(false);
        toast({
          title: "Ubicación obtenida",
          description: "Se ha actualizado tu ubicación actual",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setGettingLocation(false);
        toast({
          title: "Error de geolocalización",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};

    // Validaciones con mensajes en español
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio';
    } else if (formData.titulo.length > 25) {
      newErrors.titulo = 'El título no puede exceder 25 caracteres';
    }

    if (!formData.tipo_residuo_id) {
      newErrors.tipo_residuo_id = 'Debes seleccionar un tipo de residuo';
    }

    if (!formData.peso_estimado) {
      newErrors.peso_estimado = 'El peso estimado es obligatorio';
    } else if (isNaN(parseFloat(formData.peso_estimado)) || parseFloat(formData.peso_estimado) <= 0) {
      newErrors.peso_estimado = 'Ingresa un número válido mayor a 0 (ej: 5.5)';
    }

    if (!formData.ubicacion_lat || !formData.ubicacion_lng) {
      newErrors.ubicacion = 'Debes obtener tu ubicación usando el botón "Mi Ubicación" o ingresar coordenadas válidas';
    } else if (isNaN(parseFloat(formData.ubicacion_lat)) || isNaN(parseFloat(formData.ubicacion_lng))) {
      newErrors.ubicacion = 'Las coordenadas deben ser números válidos. Usa el botón "Mi Ubicación" para obtenerlas automáticamente';
    }

    if (!formData.fecha_vencimiento) {
      newErrors.fecha_vencimiento = 'La fecha de vencimiento es obligatoria';
    }

    // Si hay errores, mostrarlos y no continuar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Campos incompletos",
        description: "Por favor corrige los errores señalados en rojo",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      titulo: formData.titulo.trim(),
      tipo_residuo_id: formData.tipo_residuo_id,
      peso_estimado: parseFloat(formData.peso_estimado),
      ubicacion_lat: parseFloat(formData.ubicacion_lat),
      ubicacion_lng: parseFloat(formData.ubicacion_lng),
      direccion: formData.direccion || null,
      descripcion: formData.descripcion || null,
      fecha_vencimiento: formData.fecha_vencimiento,
      imagenes: formData.imagenes,
    };

    setPendingSubmitData(submitData);
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    if (pendingSubmitData) {
      await onSubmit(pendingSubmitData);
      setShowConfirm(false);
      setPendingSubmitData(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setPendingSubmitData(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-green-800">
          {lote ? 'Editar Lote' : 'Crear Nuevo Lote'}
        </CardTitle>
        <CardDescription>
          {lote ? 'Modifica la información de tu lote de R.O.A' : 'Registra un nuevo lote de residuos orgánicos aprovechables'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título del R.O.A *</Label>
            <Input
              id="titulo"
              type="text"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="ej. Cáscaras de Frutas Frescas"
              maxLength={25}
              className={`w-full ${errors.titulo ? 'border-red-500' : ''}`}
            />
            <div className="text-sm text-muted-foreground">
              {formData.titulo.length}/25 caracteres
            </div>
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_residuo_id">Tipo de Residuo *</Label>
              <Select value={formData.tipo_residuo_id} onValueChange={(value) => handleInputChange('tipo_residuo_id', value)}>
                <SelectTrigger className={errors.tipo_residuo_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={loadingTipos ? "Cargando..." : "Selecciona el tipo de R.O.A"} />
                </SelectTrigger>
                <SelectContent>
                  {tiposResiduos
                    .sort((a, b) => {
                      // Move "Otros" to the end
                      if (a.nombre.toLowerCase().includes('otros')) return 1;
                      if (b.nombre.toLowerCase().includes('otros')) return -1;
                      return a.nombre.localeCompare(b.nombre);
                    })
                    .map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.descripcion || tipo.nombre}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.tipo_residuo_id && (
                <p className="text-sm text-red-600">{errors.tipo_residuo_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso_estimado">Peso Estimado (kg) *</Label>
              <Input
                id="peso_estimado"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="ej. 5.5"
                value={formData.peso_estimado}
                onChange={(e) => handleInputChange('peso_estimado', e.target.value)}
                className={errors.peso_estimado ? 'border-red-500' : ''}
              />
              {errors.peso_estimado && (
                <p className="text-sm text-red-600">{errors.peso_estimado}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ubicación *</Label>
            <p className="text-xs text-muted-foreground">
              Usa el botón "Mi Ubicación" para obtener tus coordenadas automáticamente
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Latitud"
                value={formData.ubicacion_lat}
                onChange={(e) => handleInputChange('ubicacion_lat', e.target.value)}
                className={errors.ubicacion ? 'border-red-500' : ''}
              />
              <Input
                placeholder="Longitud"
                value={formData.ubicacion_lng}
                onChange={(e) => handleInputChange('ubicacion_lng', e.target.value)}
                className={errors.ubicacion ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className="w-full"
              >
                {gettingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="w-4 h-4 mr-2" />
                )}
                {gettingLocation ? 'Obteniendo...' : 'Mi Ubicación'}
              </Button>
            </div>
            {errors.ubicacion && (
              <p className="text-sm text-red-600">{errors.ubicacion}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección de Referencia</Label>
            <Input
              id="direccion"
              placeholder="ej. Calle 123, Barrio Centro"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento *</Label>
            <Input
              id="fecha_vencimiento"
              type="date"
              value={formData.fecha_vencimiento}
              onChange={(e) => handleInputChange('fecha_vencimiento', e.target.value)}
              min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              className={errors.fecha_vencimiento ? 'border-red-500' : ''}
            />
            <div className="text-sm text-muted-foreground">
              Fecha estimada de vencimiento del lote
            </div>
            {errors.fecha_vencimiento && (
              <p className="text-sm text-red-600">{errors.fecha_vencimiento}</p>
            )}
          </div>

          <ImageUpload
            images={formData.imagenes}
            onImagesChange={handleImagesChange}
            disabled={loading}
          />

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción Adicional</Label>
            <Textarea
              id="descripcion"
              placeholder="Información adicional sobre el lote..."
              rows={3}
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {lote ? 'Actualizar Lote' : 'Crear Lote'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
      
      <ConfirmModal
        isOpen={showConfirm}
        title={lote ? "Confirmar actualización" : "Confirmar creación"}
        message={lote ? "¿Estás seguro de que quieres actualizar este lote?" : "¿Estás seguro de que quieres crear este lote?"}
        onConfirm={handleConfirmSubmit}
        onCancel={handleCancelConfirm}
        confirmLabel="Ok"
        cancelLabel="Cancelar"
        isLoading={loading}
      />
    </Card>
  );
};
