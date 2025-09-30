import React, { useState, useEffect, useMemo } from 'react';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useAuth } from '@/hooks/useAuth';
import { useProductos } from '@/hooks/useProductos';
import { useLotes } from '@/hooks/useLotes';
import { useOrdenLotes } from '@/hooks/useOrdenLotes';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalificarOrden } from '@/components/calificaciones/CalificarOrden';
import { OrdenChat } from '@/components/ordenes/OrdenChat';
import { OrdenTimeline } from '@/components/ordenes/OrdenTimeline';
import { OrdenesStats } from '@/components/ordenes/OrdenesStats';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
const getStatusColor = (estado: string) => {
  const colors = {
    pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    aceptada: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
    completada: 'bg-blue-100 text-blue-800 border border-blue-200',
    cancelada: 'bg-red-100 text-red-800 border border-red-200'
  };
  return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800 border border-gray-200';
};
const getStatusText = (estado: string) => {
  const texts = {
    pendiente: 'Pendiente',
    aceptada: 'Aceptada',
    completada: 'Completada',
    cancelada: 'Cancelada'
  };
  return texts[estado as keyof typeof texts] || estado;
};
export const OrdenesList: React.FC = () => {
  const {
    ordenesComoSolicitante,
    ordenesComoProveedor,
    loading,
    updateOrden,
    refreshOrdenes
  } = useOrdenes();
  const {
    user
  } = useAuth();
  const {
    productos
  } = useProductos();
  const {
    lotes
  } = useLotes();
  
  // Get all lote IDs from orders to fetch them
  const loteIdsFromOrdenes = useMemo(() => {
    return [...ordenesComoSolicitante, ...ordenesComoProveedor]
      .filter(orden => orden.tipo_item === 'lote')
      .map(orden => orden.item_id);
  }, [ordenesComoSolicitante, ordenesComoProveedor]);
  
  const { getLoteById } = useOrdenLotes(loteIdsFromOrdenes);
  
  const {
    getProfileById
  } = useProfiles();
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [solicitanteFilter, setSolicitanteFilter] = useState('todas');
  const [proveedorFilter, setProveedorFilter] = useState('todas');
  const handleStatusUpdate = async (ordenId: string, newStatus: string) => {
    await updateOrden(ordenId, {
      estado: newStatus as any
    });
  };
  const getProductName = (productId: string) => {
    const producto = productos.find(p => p.id === productId);
    return producto?.nombre || 'Producto no encontrado';
  };
  const getLoteName = (loteId: string) => {
    const lote = getLoteById(loteId);
    return lote?.titulo || 'Lote no encontrado';
  };

  const getLoteInfo = (loteId: string) => {
    return getLoteById(loteId);
  };

  // Fetch profiles for requesters and providers
  useEffect(() => {
    const fetchProfiles = async () => {
      // Fetch requester profiles for orders we received
      const requesterIds = ordenesComoProveedor.map(orden => orden.solicitante_id);
      
      // Fetch provider profiles for orders we made
      const providerIds = ordenesComoSolicitante.map(orden => orden.proveedor_id);
      
      const uniqueIds = [...new Set([...requesterIds, ...providerIds])];
      
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
    
    if (ordenesComoProveedor.length > 0 || ordenesComoSolicitante.length > 0) {
      fetchProfiles();
    }
  }, [ordenesComoProveedor, ordenesComoSolicitante, getProfileById, profiles]);
  const getRequesterProfile = (userId: string) => {
    return profiles[userId] || null;
  };

  const getProviderProfile = (userId: string) => {
    return profiles[userId] || null;
  };

  // Filter orders based on status
  const filteredSolicitante = useMemo(() => {
    if (solicitanteFilter === 'todas') return ordenesComoSolicitante;
    return ordenesComoSolicitante.filter(orden => orden.estado === solicitanteFilter);
  }, [ordenesComoSolicitante, solicitanteFilter]);

  const filteredProveedor = useMemo(() => {
    if (proveedorFilter === 'todas') return ordenesComoProveedor;
    return ordenesComoProveedor.filter(orden => orden.estado === proveedorFilter);
  }, [ordenesComoProveedor, proveedorFilter]);

  // Calculate counts for filters
  const solicitanteCounts = useMemo(() => ({
    todas: ordenesComoSolicitante.length,
    pendiente: ordenesComoSolicitante.filter(o => o.estado === 'pendiente').length,
    aceptada: ordenesComoSolicitante.filter(o => o.estado === 'aceptada').length,
    completada: ordenesComoSolicitante.filter(o => o.estado === 'completada').length,
    cancelada: ordenesComoSolicitante.filter(o => o.estado === 'cancelada').length,
  }), [ordenesComoSolicitante]);

  const proveedorCounts = useMemo(() => ({
    todas: ordenesComoProveedor.length,
    pendiente: ordenesComoProveedor.filter(o => o.estado === 'pendiente').length,
    aceptada: ordenesComoProveedor.filter(o => o.estado === 'aceptada').length,
    completada: ordenesComoProveedor.filter(o => o.estado === 'completada').length,
    cancelada: ordenesComoProveedor.filter(o => o.estado === 'cancelada').length,
  }), [ordenesComoProveedor]);

  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  const OrdenCard = ({
    orden,
    isProvider = false
  }: {
    orden: any;
    isProvider?: boolean;
  }) => {
    const [showLoteDetails, setShowLoteDetails] = useState(false);
    const canUpdateStatus = isProvider && (orden.estado === 'pendiente' || orden.estado === 'aceptada');
    const canRate = !isProvider && orden.estado === 'completada';
    const requesterProfile = isProvider ? getRequesterProfile(orden.solicitante_id) : null;
    const providerProfile = !isProvider ? getProviderProfile(orden.proveedor_id) : null;
    const isCompleted = orden.estado === 'completada';
    const loteInfo = orden.tipo_item === 'lote' ? getLoteInfo(orden.item_id) : null;

    // Validate phone number - only allow numbers, spaces, hyphens, parentheses, and + sign
    const isValidPhone = (phone: string) => /^[\d\s\-\(\)\+]+$/.test(phone);
    return <Card key={orden.id} className={cn(
        "overflow-hidden",
        isCompleted && "border-blue-200 bg-blue-50/30"
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(orden.estado)}>
              {isCompleted && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {getStatusText(orden.estado)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {orden.tipo_item === 'producto' ? 'Producto' : 'Lote ROA'}
            </span>
          </div>
          
          {/* Action buttons moved to header - right side */}
          {canUpdateStatus && <div className="flex gap-2">
              {orden.estado === 'pendiente' && <>
                  <Button size="sm" onClick={() => handleStatusUpdate(orden.id, 'aceptada')}>
                    Aceptar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(orden.id, 'cancelada')}>
                    Rechazar
                  </Button>
                </>}
              {orden.estado === 'aceptada' && <Button size="sm" onClick={() => handleStatusUpdate(orden.id, 'completada')}>
                  Completar
                </Button>}
            </div>}
          
          {canRate && (
            <CalificarOrden 
              orden={{
                ...orden,
                calificado_id: isProvider ? orden.solicitante_id : orden.proveedor_id
              }} 
            />
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Timeline for completed or cancelled orders */}
          {(orden.estado === 'completada' || orden.estado === 'cancelada') && (
            <OrdenTimeline orden={orden} />
          )}

          {/* Item name with larger, more prominent font */}
          <div className="space-y-2">
            {orden.tipo_item === 'producto' ? (
              <p className="text-lg font-semibold text-foreground">
                {getProductName(orden.item_id)}
              </p>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                  {getLoteName(orden.item_id)}
                </p>
                {loteInfo?.direccion && (
                  <p className="text-sm text-muted-foreground">
                    📍 {loteInfo.direccion}
                  </p>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
              <p><span className="font-medium">Cantidad:</span> {orden.cantidad_solicitada} {orden.tipo_item === 'lote' ? 'kilogramos' : 'unidades'}</p>
              {orden.fecha_propuesta_retiro && <p><span className="font-medium">Fecha:</span> {format(new Date(orden.fecha_propuesta_retiro), 'dd/MM/yyyy')}</p>}
              {orden.hora_propuesta_retiro && <p><span className="font-medium">Hora:</span> {orden.hora_propuesta_retiro}</p>}
              {orden.modalidad_entrega && <p><span className="font-medium">Modalidad:</span> {orden.modalidad_entrega}</p>}
            </div>

            {/* Button to see lot details */}
            {orden.tipo_item === 'lote' && loteInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoteDetails(true)}
                className="mt-2"
              >
                Ver Detalles del Lote
              </Button>
            )}
          </div>

          {/* Show requester contact info for providers - improved layout */}
          {isProvider && <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-blue-900 text-sm"> Información del solicitante</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-800">Nombre:</span>
                  {requesterProfile ? <UserProfileLink userId={orden.solicitante_id} userName={requesterProfile.full_name} userEmail={requesterProfile.email} size="sm" className="text-blue-600 hover:text-blue-800" /> : <span className="text-blue-700">Cargando...</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-800">Solicitado el:</span>
                  <span className="text-blue-700">
                    {format(new Date(orden.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                
                {orden.telefono_contacto && <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-800">Teléfono:</span>
                    <span className={cn("text-blue-700", !isValidPhone(orden.telefono_contacto) && "text-red-600 font-medium")}>
                      {orden.telefono_contacto}
                      {!isValidPhone(orden.telefono_contacto) && " (⚠️ Formato no válido)"}
                    </span>
                  </div>}
                
                {orden.direccion_contacto && <div className="flex items-start gap-2">
                    <span className="font-medium text-blue-800">Dirección:</span>
                    <span className="text-blue-700 flex-1">{orden.direccion_contacto}</span>
                  </div>}
              </div>
            </div>}

          {/* Show provider info for requesters (My Requests) */}
          {!isProvider && <div className="bg-green-50 border border-green-200 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-green-900 text-sm">Información del proveedor</p>
              
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-800">Nombre:</span>
                  {providerProfile ? <UserProfileLink userId={orden.proveedor_id} userName={providerProfile.full_name} userEmail={providerProfile.email} size="sm" className="text-green-600 hover:text-green-800" /> : <span className="text-green-700">Cargando...</span>}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-medium text-green-800">Solicitado el:</span>
                  <span className="text-green-700">
                    {format(new Date(orden.created_at), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                  </span>
                </div>
                
                {providerProfile?.telefono && <div className="flex items-start gap-2">
                    <span className="font-medium text-green-800">Teléfono:</span>
                    <span className="text-green-700">{providerProfile.telefono}</span>
                  </div>}
                
                {providerProfile?.direccion && <div className="flex items-start gap-2">
                    <span className="font-medium text-green-800">Dirección:</span>
                    <span className="text-green-700 flex-1">{providerProfile.direccion}</span>
                  </div>}
              </div>
            </div>}

          <OrdenChat ordenId={orden.id} orden={orden} canSendMessages={orden.estado === 'pendiente' || orden.estado === 'aceptada'} />
          
          {/* Lot Details Modal */}
          {loteInfo && (
            <LoteDetailsModal
              isOpen={showLoteDetails}
              onClose={() => setShowLoteDetails(false)}
              lote={loteInfo}
            />
          )}
        </CardContent>
      </Card>;
  };
  return <div className="space-y-6">
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
          <OrdenesStats
            total={solicitanteCounts.todas}
            pendientes={solicitanteCounts.pendiente}
            aceptadas={solicitanteCounts.aceptada}
            completadas={solicitanteCounts.completada}
            canceladas={solicitanteCounts.cancelada}
            selectedStatus={solicitanteFilter}
            onStatusChange={setSolicitanteFilter}
          />
          
          {filteredSolicitante.length === 0 ? <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {solicitanteFilter === 'todas' 
                  ? 'No has realizado ninguna solicitud aún.'
                  : `No hay órdenes ${getStatusText(solicitanteFilter).toLowerCase()}.`
                }
              </CardContent>
            </Card> : filteredSolicitante.map(orden => <OrdenCard key={orden.id} orden={orden} />)}
        </TabsContent>
        
        <TabsContent value="recibidas" className="space-y-4">
          <OrdenesStats
            total={proveedorCounts.todas}
            pendientes={proveedorCounts.pendiente}
            aceptadas={proveedorCounts.aceptada}
            completadas={proveedorCounts.completada}
            canceladas={proveedorCounts.cancelada}
            selectedStatus={proveedorFilter}
            onStatusChange={setProveedorFilter}
          />
          
          {filteredProveedor.length === 0 ? <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {proveedorFilter === 'todas'
                  ? 'No has recibido ninguna solicitud aún.'
                  : `No hay órdenes ${getStatusText(proveedorFilter).toLowerCase()}.`
                }
              </CardContent>
            </Card> : filteredProveedor.map(orden => <OrdenCard key={orden.id} orden={orden} isProvider />)}
        </TabsContent>
      </Tabs>
    </div>;
};