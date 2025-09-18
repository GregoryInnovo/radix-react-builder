import React, { useState, useEffect } from 'react';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useAuth } from '@/hooks/useAuth';
import { useProductos } from '@/hooks/useProductos';
import { useLotes } from '@/hooks/useLotes';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalificarOrden } from '@/components/calificaciones/CalificarOrden';
import { OrdenChat } from '@/components/ordenes/OrdenChat';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const [profiles, setProfiles] = useState<Record<string, any>>({});

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

  // Fetch profiles for all requesters
  useEffect(() => {
    const fetchProfiles = async () => {
      const requesterIds = ordenesComoProveedor.map(orden => orden.solicitante_id);
      const uniqueIds = [...new Set(requesterIds)];
      
      for (const userId of uniqueIds) {
        if (!profiles[userId]) {
          const profile = await getProfileById(userId);
          if (profile) {
            setProfiles(prev => ({
              ...prev,
              [userId]: profile
            }));
          }
        }
      }
    };
    
    if (ordenesComoProveedor.length > 0) {
      fetchProfiles();
    }
  }, [ordenesComoProveedor, getProfileById, profiles]);

  const getRequesterProfile = (userId: string) => {
    return profiles[userId] || null;
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
    const requesterProfile = isProvider ? getRequesterProfile(orden.solicitante_id) : null;

    // Validate phone number - only allow numbers, spaces, hyphens, parentheses, and + sign
    const isValidPhone = (phone: string) => /^[\d\s\-\(\)\+]+$/.test(phone);

    return (
      <Card key={orden.id} className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor(orden.estado) as any}>
              {getStatusText(orden.estado)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {orden.tipo_item === 'producto' ? 'Producto' : 'Lote ROA'}
            </span>
          </div>
          
          {/* Action buttons moved to header - right side */}
          {canUpdateStatus && (
            <div className="flex gap-2">
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Item name with larger, more prominent font */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-foreground">
              {orden.tipo_item === 'producto' 
                ? `${getProductName(orden.item_id)}`
                : `Lote ROA: ${getLoteName(orden.item_id)}`
              }
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <p><span className="font-medium">Cantidad:</span> {orden.cantidad_solicitada}</p>
              {orden.fecha_propuesta_retiro && (
                <p><span className="font-medium">Fecha:</span> {format(new Date(orden.fecha_propuesta_retiro), 'dd/MM/yyyy')}</p>
              )}
              {orden.hora_propuesta_retiro && (
                <p><span className="font-medium">Hora:</span> {orden.hora_propuesta_retiro}</p>
              )}
              {orden.modalidad_entrega && (
                <p><span className="font-medium">Modalidad:</span> {orden.modalidad_entrega}</p>
              )}
            </div>
          </div>

          {/* Show requester contact info for providers - improved layout */}
          {isProvider && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-blue-900 text-sm">Información de contacto del solicitante</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-800">Nombre:</span>
                  {requesterProfile ? (
                    <UserProfileLink 
                      userId={orden.solicitante_id}
                      userName={requesterProfile.full_name}
                      userEmail={requesterProfile.email}
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    />
                  ) : (
                    <span className="text-blue-700">Cargando...</span>
                  )}
                </div>
                
                {orden.telefono_contacto && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-800">Teléfono:</span>
                    <span className={cn(
                      "text-blue-700",
                      !isValidPhone(orden.telefono_contacto) && "text-red-600 font-medium"
                    )}>
                      {orden.telefono_contacto}
                      {!isValidPhone(orden.telefono_contacto) && " (⚠️ Formato no válido)"}
                    </span>
                  </div>
                )}
                
                {orden.direccion_contacto && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-800">Dirección:</span>
                    <span className="text-blue-700 flex-1">{orden.direccion_contacto}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <OrdenChat 
            ordenId={orden.id}
            orden={orden}
            canSendMessages={orden.estado === 'pendiente' || orden.estado === 'aceptada'}
          />
        </CardContent>
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