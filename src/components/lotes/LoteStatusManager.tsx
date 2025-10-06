
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type BatchStatus = Database['public']['Enums']['batch_status'];

interface LoteStatusManagerProps {
  lote: Lote;
  onStatusChange: (newStatus: BatchStatus) => Promise<void>;
  loading: boolean;
}

const STATUS_LABELS: Record<BatchStatus, string> = {
  'disponible': 'Disponible',
  'no_disponible': 'No Disponible',
  'reservado': 'Reservado',
  'recogido': 'Recogido',
  'cancelado': 'Cancelado',
};

const STATUS_COLORS: Record<BatchStatus, string> = {
  'disponible': 'bg-green-100 text-green-800',
  'no_disponible': 'bg-gray-100 text-gray-800',
  'reservado': 'bg-yellow-100 text-yellow-800',
  'recogido': 'bg-blue-100 text-blue-800',
  'cancelado': 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<BatchStatus, React.ComponentType<any>> = {
  'disponible': CheckCircle,
  'no_disponible': XCircle,
  'reservado': Clock,
  'recogido': CheckCircle,
  'cancelado': XCircle,
};

// Define valid status transitions
const VALID_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  'disponible': ['no_disponible', 'reservado'],
  'no_disponible': ['disponible'],
  'reservado': ['recogido', 'cancelado'],
  'recogido': [], // Final state
  'cancelado': ['disponible'], // Can be reactivated
};

export const LoteStatusManager = ({ lote, onStatusChange, loading }: LoteStatusManagerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | ''>('');
  const [isChanging, setIsChanging] = useState(false);

  // Only approved lotes can change availability status
  if (lote.status !== 'aprobado') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            Estado del Lote No Disponible
          </CardTitle>
          <CardDescription>
            Solo los lotes aprobados pueden cambiar su estado de disponibilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              {lote.status === 'pendiente' && 'Este lote está pendiente de aprobación por un administrador.'}
              {lote.status === 'rechazado' && 'Este lote fue rechazado. Revisa los comentarios del administrador.'}
              {!lote.status && 'Este lote está pendiente de aprobación.'}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStatus = lote.estado;
  const availableStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const StatusIcon = STATUS_ICONS[currentStatus];

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === currentStatus) return;

    setIsChanging(true);
    try {
      await onStatusChange(selectedStatus as BatchStatus);
      setSelectedStatus('');
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsChanging(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setSelectedStatus(value as BatchStatus);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Estado del Lote
        </CardTitle>
        <CardDescription>
          Gestiona el estado actual de tu lote de R.O.A
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Estado actual:</span>
          <Badge className={STATUS_COLORS[currentStatus]}>
            {STATUS_LABELS[currentStatus]}
          </Badge>
        </div>

        {availableStatuses.length > 0 ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cambiar estado:</label>
              <Select value={selectedStatus} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nuevo estado" />
                </SelectTrigger>
                <SelectContent>
                  {availableStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleStatusChange}
              disabled={!selectedStatus || selectedStatus === currentStatus || isChanging || loading}
              className="w-full"
            >
              {isChanging ? 'Cambiando estado...' : 'Cambiar Estado'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {currentStatus === 'recogido' 
                ? 'Este lote ya ha sido recogido (estado final)'
                : 'No hay cambios de estado disponibles'
              }
            </span>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Transiciones permitidas:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Disponible ↔ No Disponible</li>
            <li>Disponible → Reservado</li>
            <li>Reservado → Recogido, Cancelado</li>
            <li>Cancelado → Disponible</li>
            <li>Recogido → (Estado final)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
