import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Weight, Calendar, Clock, User, FileText, Image, History, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { LoteImageGallery } from './LoteImageGallery';
import { LoteStatusHistory } from './LoteStatusHistory';
import { ReservarLote } from './ReservarLote';
import { useState } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { EntityIdDisplay } from '@/components/ui/entity-id-display';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
};

interface LoteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lote: Lote;
  distance?: number;
  showReservarButton?: boolean;
}

export const LoteDetailsModal: React.FC<LoteDetailsModalProps> = ({
  isOpen,
  onClose,
  lote,
  distance,
  showReservarButton = true
}) => {
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'aprobado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      case 'disponible':
        return 'bg-blue-100 text-blue-800';
      case 'reservado':
        return 'bg-orange-100 text-orange-800';
      case 'recolectado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      case 'disponible':
        return 'Disponible';
      case 'reservado':
        return 'Reservado';
      case 'recolectado':
        return 'Recolectado';
      default:
        return status;
    }
  };

  const isExpired = (fecha_vencimiento: string | null) => {
    if (!fecha_vencimiento) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(fecha_vencimiento);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  const images = lote.imagenes || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-800">
              {lote.titulo || 'Detalles del Lote de R.O.A'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ID del Lote */}
            <div className="pb-4 border-b">
              <EntityIdDisplay id={lote.id} label="ID del Lote" />
            </div>
            {/* Approval Status Alert */}
            {lote.status === 'rechazado' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Lote Rechazado</AlertTitle>
                <AlertDescription>
                  {lote.admin_notes || 'Este lote ha sido rechazado por un administrador. Por favor, revisa y corrige los problemas antes de volver a publicar.'}
                </AlertDescription>
              </Alert>
            )}
            {lote.status === 'pendiente' && (
              <Alert className="border-yellow-500 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">En Revisión</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Tu lote está siendo revisado por nuestro equipo. Recibirás una notificación cuando sea aprobado o si necesita algún ajuste.
                </AlertDescription>
              </Alert>
            )}
            {lote.status === 'aprobado' && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Lote Aprobado</AlertTitle>
                <AlertDescription className="text-green-700">
                  Tu lote ha sido aprobado y ahora es visible para todos los usuarios de la plataforma.
                  {lote.admin_notes && ` Mensaje del administrador: ${lote.admin_notes}`}
                </AlertDescription>
              </Alert>
            )}

            {/* Status and Distance */}
            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(lote.estado || 'pendiente')}>
                {getStatusLabel(lote.estado || 'pendiente')}
              </Badge>
              {distance !== undefined && (
                <Badge variant="outline">
                  <MapPin className="w-3 h-3 mr-1" />
                  {formatDistance(distance)}
                </Badge>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Weight className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Peso estimado:</span>
                  <span className="font-semibold">{lote.peso_estimado} kg</span>
                </div>

                {lote.tipos_residuo && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="font-semibold">{lote.tipos_residuo.nombre}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Creado:</span>
                  <span className="font-semibold">
                    {new Date(lote.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {lote.fecha_vencimiento && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Vence el:</span>
                    <span className="font-semibold">
                      {new Date(lote.fecha_vencimiento).toLocaleDateString()}
                    </span>
                    {isExpired(lote.fecha_vencimiento) && (
                      <Badge variant="destructive" className="ml-2">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Vencido
                      </Badge>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Location */}
            {lote.direccion && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Ubicación
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {lote.direccion}
                </p>
              </div>
            )}

            {/* Description */}
            {lote.descripcion && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Descripción
                </h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {lote.descripcion}
                </p>
              </div>
            )}

            {/* Images */}
            {images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Imágenes ({images.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.slice(0, 6).map((image, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setShowImageGallery(true)}
                    >
                      <img
                        src={image}
                        alt={`Imagen ${index + 1} del lote`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {index === 5 && images.length > 6 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            +{images.length - 6} más
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {images.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageGallery(true)}
                    className="mt-3 w-full"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Ver todas las imágenes ({images.length})
                  </Button>
                )}
              </div>
            )}

            {/* Additional Info */}
            {lote.tipos_residuo?.descripcion && (
              <div>
                <h3 className="font-semibold mb-2">Información del tipo de residuo</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {lote.tipos_residuo.descripcion}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowHistory(!showHistory)}
                  className={showReservarButton ? "flex-1" : "w-full"}
                >
                  <History className="w-4 h-4 mr-2" />
                  {showHistory ? 'Ocultar' : 'Ver'} Historial
                </Button>
                {showReservarButton && <ReservarLote lote={lote} className="flex-1" />}
              </div>
              
              {showHistory && (
                <div className="mt-4">
                  <LoteStatusHistory loteId={lote.id} />
                </div>
              )}

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <LoteImageGallery
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        images={images}
        loteTitle="Lote de ROA"
      />
    </>
  );
};