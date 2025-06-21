
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type ROAType = Database['public']['Enums']['roa_type'];

interface LoteFormProps {
  lote?: Lote;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
  onCancel: () => void;
}

const ROA_TYPES: { value: ROAType; label: string }[] = [
  { value: 'cascara_fruta', label: 'Cáscara de fruta' },
  { value: 'posos_cafe', label: 'Posos de café' },
  { value: 'restos_vegetales', label: 'Restos vegetales' },
  { value: 'cascara_huevo', label: 'Cáscara de huevo' },
  { value: 'restos_cereales', label: 'Restos de cereales' },
  { value: 'otros', label: 'Otros' },
];

export const LoteForm = ({ lote, onSubmit, loading, onCancel }: LoteFormProps) => {
  const [formData, setFormData] = useState({
    tipo_residuo: lote?.tipo_residuo || '',
    peso_estimado: lote?.peso_estimado?.toString() || '',
    ubicacion_lat: lote?.ubicacion_lat?.toString() || '',
    ubicacion_lng: lote?.ubicacion_lng?.toString() || '',
    direccion: lote?.direccion || '',
    descripcion: lote?.descripcion || '',
    fecha_disponible: lote?.fecha_disponible || new Date().toISOString().split('T')[0],
  });

  const [gettingLocation, setGettingLocation] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    if (!formData.tipo_residuo || !formData.peso_estimado || !formData.ubicacion_lat || !formData.ubicacion_lng) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      tipo_residuo: formData.tipo_residuo as ROAType,
      peso_estimado: parseFloat(formData.peso_estimado),
      ubicacion_lat: parseFloat(formData.ubicacion_lat),
      ubicacion_lng: parseFloat(formData.ubicacion_lng),
      direccion: formData.direccion || null,
      descripcion: formData.descripcion || null,
      fecha_disponible: formData.fecha_disponible,
    };

    await onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-green-800">
          {lote ? 'Editar Lote' : 'Crear Nuevo Lote'}
        </CardTitle>
        <CardDescription>
          {lote ? 'Modifica la información de tu lote de ROA' : 'Registra un nuevo lote de residuos orgánicos aprovechables'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_residuo">Tipo de Residuo *</Label>
              <Select value={formData.tipo_residuo} onValueChange={(value) => handleInputChange('tipo_residuo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo de ROA" />
                </SelectTrigger>
                <SelectContent>
                  {ROA_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ubicación *</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                placeholder="Latitud"
                value={formData.ubicacion_lat}
                onChange={(e) => handleInputChange('ubicacion_lat', e.target.value)}
              />
              <Input
                placeholder="Longitud"
                value={formData.ubicacion_lng}
                onChange={(e) => handleInputChange('ubicacion_lng', e.target.value)}
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
            <Label htmlFor="fecha_disponible">Fecha Disponible</Label>
            <Input
              id="fecha_disponible"
              type="date"
              value={formData.fecha_disponible}
              onChange={(e) => handleInputChange('fecha_disponible', e.target.value)}
            />
          </div>

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
    </Card>
  );
};
