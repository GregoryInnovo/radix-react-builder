
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Weight, Eye, Edit2, Trash2, Package } from 'lucide-react';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
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

const getStatusColor = (estado: string) => {
  const colors = {
    disponible: 'bg-green-100 text-green-800',
    reservado: 'bg-yellow-100 text-yellow-800',
    recogido: 'bg-blue-100 text-blue-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (estado: string) => {
  const texts = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    recogido: 'Recogido',
    cancelado: 'Cancelado',
  };
  return texts[estado as keyof typeof texts] || estado;
};

export const LotesList: React.FC<LotesListProps> = ({
  lotes,
  loading,
  onEdit,
  onView,
  onDelete
}) => {
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
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (lotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay lotes disponibles</h3>
            <p className="text-sm">
              Aún no has creado ningún lote de ROA. ¡Crea tu primer lote para comenzar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lotes.map((lote) => (
        <Card key={lote.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {lote.tipo_residuo.replace('_', ' ').charAt(0).toUpperCase() + 
                 lote.tipo_residuo.replace('_', ' ').slice(1)}
              </CardTitle>
              <Badge className={getStatusColor(lote.estado)}>
                {getStatusText(lote.estado)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm line-clamp-2">
              {lote.descripcion}
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Weight className="w-4 h-4 mr-2" />
                <span>{lote.peso_estimado} kg</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>
                  Disponible: {format(new Date(lote.fecha_disponible), 'PP', { locale: es })}
                </span>
              </div>
              
              {lote.direccion && (
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="truncate">{lote.direccion}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
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
                <Edit2 className="w-4 h-4 mr-1" />
                Editar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(lote.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <SolicitarIntercambio
              tipo_item="lote"
              item_id={lote.id}
              proveedor_id={lote.user_id}
              disabled={lote.estado !== 'disponible'}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
