
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Weight, Trash2, Edit } from 'lucide-react';
import { useLotes } from '@/hooks/useLotes';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { useAuth } from '@/hooks/useAuth';

const getStatusColor = (estado: string) => {
  const colors = {
    disponible: 'bg-green-100 text-green-800',
    reservado: 'bg-yellow-100 text-yellow-800',
    recogido: 'bg-blue-100 text-blue-800',
    cancelado: 'bg-red-100 text-red-800',
  };
  return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getTipoResiduoLabel = (tipo: string) => {
  const labels = {
    cascara_fruta: 'Cáscara de Fruta',
    posos_cafe: 'Posos de Café',
    restos_vegetales: 'Restos Vegetales',
    cascara_huevo: 'Cáscara de Huevo',
    restos_cereales: 'Restos de Cereales',
    otros: 'Otros',
  };
  return labels[tipo as keyof typeof labels] || tipo;
};

interface LotesListProps {
  showActions?: boolean;
  onEdit?: (lote: any) => void;
}

export const LotesList: React.FC<LotesListProps> = ({ showActions = true, onEdit }) => {
  const { lotes, loading, deleteLote } = useLotes();
  const { user } = useAuth();

  if (loading) {
    return <div className="text-center p-8">Cargando lotes...</div>;
  }

  if (lotes.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay lotes disponibles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {lotes.map((lote) => {
        const isOwner = user?.id === lote.user_id;
        
        return (
          <Card key={lote.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  {getTipoResiduoLabel(lote.tipo_residuo)}
                </CardTitle>
                <Badge className={getStatusColor(lote.estado)}>
                  {lote.estado}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Weight className="h-4 w-4" />
                  <span>{lote.peso_estimado} kg estimados</span>
                </div>
                
                {lote.direccion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{lote.direccion}</span>
                  </div>
                )}
                
                {lote.fecha_disponible && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Disponible: {format(new Date(lote.fecha_disponible), 'PP', { locale: es })}
                    </span>
                  </div>
                )}
              </div>

              {lote.descripcion && (
                <p className="text-sm text-gray-700 line-clamp-3">
                  {lote.descripcion}
                </p>
              )}

              {showActions && (
                <div className="flex gap-2 pt-2">
                  {isOwner ? (
                    <>
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(lote)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteLote(lote.id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </>
                  ) : (
                    <SolicitarIntercambio
                      tipo_item="lote"
                      item_id={lote.id}
                      proveedor_id={lote.user_id}
                      disabled={lote.estado !== 'disponible'}
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
