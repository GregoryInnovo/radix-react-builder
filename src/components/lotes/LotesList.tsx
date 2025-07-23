
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Weight, Eye, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface LotesListProps {
  lotes: Lote[];
  loading: boolean;
  onEdit: (lote: Lote) => void;
  onView: (lote: Lote) => void;
  onDelete: (id: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'disponible':
      return 'bg-green-100 text-green-800';
    case 'reservado':
      return 'bg-yellow-100 text-yellow-800';
    case 'recogido':
      return 'bg-blue-100 text-blue-800';
    case 'cancelado':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getResiduoLabel = (tipo: string) => {
  const types = {
    cascara_fruta: 'Cáscara de fruta',
    posos_cafe: 'Posos de café',
    restos_vegetales: 'Restos vegetales',
    cascara_huevo: 'Cáscara de huevo',
    restos_cereales: 'Restos de cereales',
    otros: 'Otros',
  };
  return types[tipo as keyof typeof types] || tipo;
};

export const LotesList = ({ lotes, loading, onEdit, onView, onDelete }: LotesListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (lotes.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="text-gray-500">
            <Weight className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No tienes lotes creados aún</p>
            <p className="text-sm mt-2">Crea tu primer lote de ROA para comenzar</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lotes.map((lote) => (
        <Card key={lote.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg text-green-800">
                  {getResiduoLabel(lote.tipo_residuo)}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(lote.created_at || ''), 'PP', { locale: es })}
                </div>
              </div>
              <Badge className={getStatusColor(lote.estado)}>
                {lote.estado}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Imagen de previsualización */}
            {lote.imagenes && lote.imagenes.length > 0 ? (
              <div className="mb-4 relative">
                <img
                  src={lote.imagenes[0]}
                  alt={`Lote ${getResiduoLabel(lote.tipo_residuo)}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
                {lote.imagenes.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    +{lote.imagenes.length - 1} más
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Sin imágenes</p>
                </div>
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Weight className="w-4 h-4 mr-1 text-gray-500" />
                  <span>Peso:</span>
                </div>
                <span className="font-medium">{lote.peso_estimado} kg</span>
              </div>
              
              {lote.direccion && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-500 flex-shrink-0" />
                  <span className="truncate">{lote.direccion}</span>
                </div>
              )}
              
              {lote.descripcion && (
                <p className="text-gray-600 text-sm line-clamp-2">
                  {lote.descripcion}
                </p>
              )}
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(lote)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(lote)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(lote.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
