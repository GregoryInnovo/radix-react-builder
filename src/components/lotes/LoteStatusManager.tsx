
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

const STATUS_ICONS: Record<BatchStatus, React.ComponentType<any>> = {
  'disponible': CheckCircle,
  'reservado': Clock,
  'recogido': CheckCircle,
  'cancelado': XCircle,
};

// Define valid status transitions
const VALID_TRANSITIONS: Record<BatchStatus, BatchStatus[]> = {
  'disponible': ['reservado', 'cancelado'],
  'reservado': ['recogido', 'cancelado', 'disponible'],
  'recogido': [], // Final state
  'cancelado': ['disponible'], // Can be reactivated
};

export const LoteStatusManager = ({ lote, onStatusChange, loading }: LoteStatusManagerProps) => {
  const [selectedStatus, setSelectedStatus] = useState<BatchStatus | ''>('');
  const [isChanging, setIsChanging] = useState(false);

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
          Gestiona el estado actual de tu lote de ROA
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
            <li>Disponible → Reservado, Cancelado</li>
            <li>Reservado → Recogido, Cancelado, Disponible</li>
            <li>Cancelado → Disponible</li>
            <li>Recogido → (Estado final)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
