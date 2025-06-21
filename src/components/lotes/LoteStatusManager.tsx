
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Clock, Package, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type BatchStatus = Database['public']['Enums']['batch_status'];
type Lote = Database['public']['Tables']['lotes']['Row'];

interface LoteStatusManagerProps {
  lote: Lote;
  onStatusChange: (newStatus: BatchStatus) => Promise<void>;
  loading?: boolean;
}

const STATUS_LABELS: Record<BatchStatus, string> = {
  'disponible': 'Disponible',
  'reservado': 'Reservado',
  'recogido': 'Recogido',
  'cancelado': 'Cancelado',
};

const STATUS_COLORS: Record<BatchStatus, string> = {
  'disponible': 'bg-green-100 text-green-800',
  'reservado': 'bg-yellow-100 text-yellow-800',
  'recogido': 'bg-blue-100 text-blue-800',
  'cancelado': 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<BatchStatus, any> = {
  'disponible': Package,
  'reservado': Clock,
  'recogido': CheckCircle,
  'cancelado': XCircle,
};

// Lógica de transiciones de estado permitidas
const ALLOWED_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  'disponible': ['reservado', 'cancelado'],
  'reservado': ['recogido', 'cancelado', 'disponible'],
  'recogido': [], // Estado final
  'cancelado': ['disponible'], // Solo se puede reactivar
};

export const LoteStatusManager = ({ lote, onStatusChange, loading }: LoteStatusManagerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | ''>('');
  const [isChanging, setIsChanging] = useState(false);

  const allowedStatuses = ALLOWED_TRANSITIONS[lote.estado] || [];
  const currentStatus = lote.estado;
  const StatusIcon = STATUS_ICONS[currentStatus];

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return;

    setIsChanging(true);
    try {
      await onStatusChange(selectedStatus as BatchStatus);
      setSelectedStatus('');
      toast({
        title: "Estado actualizado",
        description: `El lote ahora está ${STATUS_LABELS[selectedStatus as BatchStatus].toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error changing status:', error);
      toast({
        title: "Error al cambiar estado",
        description: "No se pudo actualizar el estado del lote",
        variant: "destructive",
      });
    } finally {
      setIsChanging(false);
    }
  };

  const getStatusDescription = (status: BatchStatus) => {
    const descriptions: Record<BatchStatus, string> = {
      'disponible': 'El lote está disponible para ser reservado',
      'reservado': 'El lote ha sido reservado por alguien',
      'recogido': 'El lote ya fue recogido - proceso completado',
      'cancelado': 'El lote fue cancelado y no está disponible',
    };
    return descriptions[status];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <StatusIcon className="w-5 h-5" />
          Estado del Lote
        </CardTitle>
        <CardDescription>
          Gestiona el estado actual de tu lote de ROA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Badge className={STATUS_COLORS[currentStatus]}>
            {STATUS_LABELS[currentStatus]}
          </Badge>
          <span className="text-sm text-gray-600">
            {getStatusDescription(currentStatus)}
          </span>
        </div>

        {allowedStatuses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Cambiar estado a..." />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedStatus && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={loading || isChanging || !selectedStatus}
                      className="min-w-[100px]"
                    >
                      {isChanging ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Cambiar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar cambio de estado</AlertDialogTitle>
                      <AlertDialogDescription>
                        ¿Estás seguro de que quieres cambiar el estado de este lote a "
                        {STATUS_LABELS[selectedStatus as BatchStatus]}"?
                        {selectedStatus === 'recogido' && (
                          <span className="block mt-2 font-medium text-amber-600">
                            ⚠️ Una vez marcado como recogido, no podrás cambiar el estado nuevamente.
                          </span>
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleStatusChange}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Sí, cambiar estado
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {selectedStatus && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Nuevo estado:</strong> {getStatusDescription(selectedStatus as BatchStatus)}
                </p>
              </div>
            )}
          </div>
        )}

        {allowedStatuses.length === 0 && currentStatus === 'recogido' && (
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              ✅ Este lote ha sido completado exitosamente. No se pueden realizar más cambios de estado.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
