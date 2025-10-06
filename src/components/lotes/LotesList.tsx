
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Weight, Eye, Edit, Trash2, Image as ImageIcon, AlertTriangle, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { LoteImageGallery } from './LoteImageGallery';
import { LoteStatusManager } from './LoteStatusManager';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
};

interface LotesListProps {
  lotes: Lote[];
  loading: boolean;
  onEdit: (lote: Lote) => void;
  onView: (lote: Lote) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: any) => Promise<void>;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'disponible':
      return 'bg-green-100 text-green-800';
    case 'no_disponible':
      return 'bg-gray-100 text-gray-800';
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

const getResiduoLabel = (lote: Lote) => {
  if (lote.tipos_residuo) {
    return lote.tipos_residuo.descripcion || lote.tipos_residuo.nombre;
  }
  
  // Fallback para datos antiguos
  const types = {
    cascara_fruta: 'Cáscara de fruta',
    posos_cafe: 'Posos de café',
    restos_vegetales: 'Restos vegetales',
    cascara_huevo: 'Cáscara de huevo',
    restos_cereales: 'Restos de cereales',
    otros: 'Otros',
  };
  return 'Tipo no disponible';
};

const isExpired = (fecha_vencimiento: string | null) => {
  if (!fecha_vencimiento) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expDate = new Date(fecha_vencimiento);
  expDate.setHours(0, 0, 0, 0);
  return expDate < today;
};

export const LotesList = ({ lotes, loading, onEdit, onView, onDelete, onStatusChange }: LotesListProps) => {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loteToDelete, setLoteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);
  const [loteForStatus, setLoteForStatus] = useState<Lote | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [loteForRejectReason, setLoteForRejectReason] = useState<Lote | null>(null);

  const handleViewImages = (lote: Lote) => {
    setSelectedLote(lote);
    setIsGalleryOpen(true);
  };

  const handleView = (lote: Lote) => {
    if (lote.imagenes && lote.imagenes.length > 0) {
      handleViewImages(lote);
    } else {
      onView(lote);
    }
  };

  const handleDeleteClick = (id: string) => {
    setLoteToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (loteToDelete) {
      setIsDeleting(true);
      await onDelete(loteToDelete);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setLoteToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setLoteToDelete(null);
  };

  const handleStatusClick = (lote: Lote) => {
    setLoteForStatus(lote);
    setShowStatusManager(true);
  };

  const handleStatusChangeSubmit = async (newStatus: any) => {
    if (loteForStatus) {
      setIsChangingStatus(true);
      await onStatusChange(loteForStatus.id, newStatus);
      setIsChangingStatus(false);
      setShowStatusManager(false);
      setLoteForStatus(null);
    }
  };

  const handleViewRejectReason = (lote: Lote) => {
    setLoteForRejectReason(lote);
    setShowRejectReason(true);
  };
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
            <p className="text-sm mt-2">Crea tu primer lote de R.O.A para comenzar</p>
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
                  {lote.titulo || getResiduoLabel(lote)}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 flex-wrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {lote.fecha_vencimiento ? 
                      `Vence: ${format(new Date(lote.fecha_vencimiento), 'PP', { locale: es })}` :
                      format(new Date(lote.created_at || ''), 'PP', { locale: es })
                    }
                  </div>
                  {lote.fecha_vencimiento && isExpired(lote.fecha_vencimiento) && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Vencido
                    </Badge>
                  )}
                </div>
                {/* Approval Status Badge */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {lote.status === 'pendiente' && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      ⏳ En revisión - Pendiente de aprobación
                    </Badge>
                  )}
                  {lote.status === 'aprobado' && (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      ✓ Aprobado - Visible públicamente
                    </Badge>
                  )}
                  {lote.status === 'rechazado' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewRejectReason(lote)}
                      className="h-auto px-2.5 py-0.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-full border-0"
                    >
                      ✗ Rechazado - Ver motivo
                    </Button>
                  )}
                  {lote.status === 'aprobado' && (
                    <Badge className={getStatusColor(lote.estado)}>
                      {lote.estado}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Imagen de previsualización */}
            {lote.imagenes && lote.imagenes.length > 0 ? (
              <div className="mb-4 relative">
                <img
                  src={lote.imagenes[0]}
                  alt={`Lote ${getResiduoLabel(lote)}`}
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
                onClick={() => handleView(lote)}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-1" />
                {lote.imagenes && lote.imagenes.length > 0 ? 'Ver Imágenes' : 'Ver'}
              </Button>
              {lote.status === 'aprobado' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusClick(lote)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Estado
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(lote)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteClick(lote.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Modal de galería de imágenes */}
      <LoteImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={selectedLote?.imagenes || []}
        loteTitle={selectedLote ? getResiduoLabel(selectedLote) : ''}
      />
      
      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Confirmar eliminación"
        message="Esta acción es permanente. ¿Estás seguro de que quieres eliminar este lote?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmLabel="Ok"
        cancelLabel="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />

      {/* Modal de gestión de estado */}
      <Dialog open={showStatusManager} onOpenChange={setShowStatusManager}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestionar Estado del Lote</DialogTitle>
          </DialogHeader>
          {loteForStatus && (
            <LoteStatusManager
              lote={loteForStatus}
              onStatusChange={handleStatusChangeSubmit}
              loading={isChangingStatus}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de motivo de rechazo */}
      <Dialog open={showRejectReason} onOpenChange={setShowRejectReason}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-xl">✗</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Motivo del rechazo</h3>
                {loteForRejectReason && (
                  <p className="text-sm text-muted-foreground">Lote: {loteForRejectReason.titulo}</p>
                )}
              </div>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {loteForRejectReason?.admin_notes || 'No se especificó un motivo de rechazo.'}
              </p>
            </div>
            <Button 
              onClick={() => {
                setShowRejectReason(false);
                setLoteForRejectReason(null);
              }}
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
