import React from 'react';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useAuth } from '@/hooks/useAuth';
import { useProductos } from '@/hooks/useProductos';
import { useLotes } from '@/hooks/useLotes';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalificarOrden } from '@/components/calificaciones/CalificarOrden';
import { OrdenChat } from '@/components/ordenes/OrdenChat';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const { ordenesComoSolicitante, ordenesComoProveedor, loading, updateOrden, refreshOrdenes } = useOrdenes();
  const { user } = useAuth();
  const { productos } = useProductos();
  const { lotes } = useLotes();
  const { getProfileById } = useProfiles();

  const handleStatusUpdate = async (ordenId: string, newStatus: string) => {
    await updateOrden(ordenId, { estado: newStatus as any });
  };

  const getProductName = (productId: string) => {
    const producto = productos.find(p => p.id === productId);
    return producto?.nombre || 'Producto no encontrado';
  };

  const getLoteName = (loteId: string) => {
    const lote = lotes.find(l => l.id === loteId);
    if (!lote) return 'Lote no encontrado';
    return `${lote.peso_estimado}kg - ${lote.direccion || 'Sin dirección'}`;
  };

  const getRequesterName = (userId: string) => {
    // For now, return a placeholder - this will be improved with proper profile fetching
    return 'Usuario';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const OrdenCard = ({ orden, isProvider = false }: { orden: any; isProvider?: boolean }) => {
    const canUpdateStatus = isProvider && orden.estado === 'pendiente';
    const canRate = !isProvider && orden.estado === 'completada';

    return (
      <Card key={orden.id} className="overflow-hidden">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={getStatusColor(orden.estado) as any}>
                  {getStatusText(orden.estado)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {orden.tipo_item === 'producto' ? 'Producto' : 'Lote ROA'}
                </span>
              </div>
              
              {/* Show item name and details */}
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {orden.tipo_item === 'producto' 
                    ? `Producto: ${getProductName(orden.item_id)}`
                    : `Lote ROA: ${getLoteName(orden.item_id)}`
                  }
                </p>
                <p>Cantidad solicitada: {orden.cantidad_solicitada}</p>
                {orden.fecha_propuesta_retiro && (
                  <p>Fecha propuesta: {format(new Date(orden.fecha_propuesta_retiro), 'dd/MM/yyyy')}</p>
                )}
                {orden.hora_propuesta_retiro && (
                  <p>Hora propuesta: {orden.hora_propuesta_retiro}</p>
                )}
                {orden.modalidad_entrega && (
                  <p>Modalidad: {orden.modalidad_entrega}</p>
                )}
              </div>

              {/* Show requester contact info for providers */}
              {isProvider && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm space-y-1">
                  <p className="font-medium text-blue-900">Información de contacto del solicitante:</p>
                  <p><strong>Nombre:</strong> {getRequesterName(orden.solicitante_id)}</p>
                  {orden.telefono_contacto && (
                    <p><strong>Teléfono:</strong> {orden.telefono_contacto}</p>
                  )}
                  {orden.direccion_contacto && (
                    <p><strong>Dirección:</strong> {orden.direccion_contacto}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2 min-w-fit">
              {canUpdateStatus && (
                <div className="flex gap-1">
                  {orden.estado === 'pendiente' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(orden.id, 'aceptada')}
                      >
                        Aceptar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(orden.id, 'cancelada')}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  {orden.estado === 'aceptada' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(orden.id, 'completada')}
                    >
                      Completar
                    </Button>
                  )}
                </div>
              )}
              
              {canRate && (
                <CalificarOrden 
                  orden={orden}
                />
              )}
            </div>
          </div>

          <OrdenChat 
            ordenId={orden.id}
            orden={orden}
            canSendMessages={orden.estado === 'pendiente' || orden.estado === 'aceptada'}
          />
        </div>
      </Card>
    );
  };

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