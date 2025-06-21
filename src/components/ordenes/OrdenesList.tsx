
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useOrdenes } from '@/hooks/useOrdenes';
import { CalificarOrden } from '@/components/calificaciones/CalificarOrden';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Package, MapPin, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const getStatusColor = (estado: string) => {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    aceptada: 'bg-green-100 text-green-800',
    completada: 'bg-blue-100 text-blue-800',
    cancelada: 'bg-red-100 text-red-800',
  };
  return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

const getStatusText = (estado: string) => {
  const texts = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };
  return texts[estado as keyof typeof texts] || estado;
};

export const OrdenesList: React.FC = () => {
  const { ordenesComoSolicitante, ordenesComoProveedor, updateOrden, loading } = useOrdenes();
  const { user } = useAuth();
  const [responseMessages, setResponseMessages] = useState<Record<string, string>>({});

  const handleStatusUpdate = async (ordenId: string, newStatus: string, mensaje?: string) => {
    await updateOrden(ordenId, { 
      estado: newStatus as any,
      mensaje_respuesta: mensaje || null
    });
  };

  const OrdenCard = ({ orden, isProvider = false }: { orden: any; isProvider?: boolean }) => (
    <Card key={orden.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {orden.tipo_item === 'lote' ? 'Lote de ROA' : 'Producto'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Clock className="h-4 w-4" />
              {format(new Date(orden.created_at), 'PPp', { locale: es })}
            </div>
          </div>
          <Badge className={getStatusColor(orden.estado)}>
            {getStatusText(orden.estado)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span>Cantidad: {orden.cantidad_solicitada}</span>
          </div>
          {orden.fecha_propuesta_retiro && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>Retiro: {format(new Date(orden.fecha_propuesta_retiro), 'PP', { locale: es })}</span>
            </div>
          )}
        </div>

        {orden.mensaje_solicitud && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <MessageSquare className="h-4 w-4" />
              Mensaje de solicitud:
            </div>
            <p className="text-sm text-gray-700">{orden.mensaje_solicitud}</p>
          </div>
        )}

        {orden.mensaje_respuesta && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <MessageSquare className="h-4 w-4" />
              Respuesta del proveedor:
            </div>
            <p className="text-sm text-gray-700">{orden.mensaje_respuesta}</p>
          </div>
        )}

        {isProvider && orden.estado === 'pendiente' && (
          <div className="border-t pt-3 space-y-3">
            <Textarea
              placeholder="Mensaje de respuesta (opcional)..."
              value={responseMessages[orden.id] || ''}
              onChange={(e) => setResponseMessages(prev => ({
                ...prev,
                [orden.id]: e.target.value
              }))}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusUpdate(orden.id, 'aceptada', responseMessages[orden.id])}
                className="flex-1"
                size="sm"
              >
                Aceptar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(orden.id, 'cancelada', responseMessages[orden.id])}
                className="flex-1"
                size="sm"
              >
                Rechazar
              </Button>
            </div>
          </div>
        )}

        {orden.estado === 'aceptada' && (
          <div className="border-t pt-3">
            <Button
              onClick={() => handleStatusUpdate(orden.id, 'completada')}
              className="w-full"
              size="sm"
            >
              Marcar como Completada
            </Button>
          </div>
        )}

        {orden.estado === 'completada' && (
          <div className="border-t pt-3 space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Calificar participantes:
            </div>
            <div className="grid grid-cols-1 gap-2">
              {/* Calificar al proveedor (si soy el solicitante) */}
              {user?.id === orden.solicitante_id && (
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Calificar al proveedor:</div>
                  <CalificarOrden 
                    orden={{
                      ...orden,
                      // Override para que califique al proveedor
                      calificado_id: orden.proveedor_id
                    }} 
                  />
                </div>
              )}
              
              {/* Calificar al solicitante (si soy el proveedor) */}
              {user?.id === orden.proveedor_id && (
                <div className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-2">Calificar al solicitante:</div>
                  <CalificarOrden 
                    orden={{
                      ...orden,
                      // Override para que califique al solicitante
                      calificado_id: orden.solicitante_id
                    }} 
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="flex justify-center p-8">Cargando órdenes...</div>;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="solicitudes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solicitudes">
            Mis Solicitudes ({ordenesComoSolicitante.length})
          </TabsTrigger>
          <TabsTrigger value="recibidas">
            Recibidas ({ordenesComoProveedor.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="solicitudes" className="space-y-4">
          {ordenesComoSolicitante.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No has realizado ninguna solicitud aún.
              </CardContent>
            </Card>
          ) : (
            ordenesComoSolicitante.map(orden => (
              <OrdenCard key={orden.id} orden={orden} />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="recibidas" className="space-y-4">
          {ordenesComoProveedor.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No has recibido ninguna solicitud aún.
              </CardContent>
            </Card>
          ) : (
            ordenesComoProveedor.map(orden => (
              <OrdenCard key={orden.id} orden={orden} isProvider />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
