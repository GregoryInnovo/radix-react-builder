
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type BatchStatus = Database['public']['Enums']['batch_status'];

interface StatusChange {
  id: string;
  lote_id: string;
  estado_anterior: BatchStatus | null;
  estado_nuevo: BatchStatus;
  fecha_cambio: string;
  created_at: string;
}

interface LoteStatusHistoryProps {
  loteId: string;
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

export const LoteStatusHistory = ({ loteId }: LoteStatusHistoryProps) => {
  const [history, setHistory] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusHistory();
  }, [loteId]);

  const fetchStatusHistory = async () => {
    try {
      // Por ahora simulamos el historial basado en la fecha de creación y actualización
      // En una implementación completa, tendríamos una tabla separada para el historial
      const { data: lote, error } = await supabase
        .from('lotes')
        .select('*')
        .eq('id', loteId)
        .single();

      if (error) throw error;

      // Simular historial básico
      const mockHistory: StatusChange[] = [
        {
          id: '1',
          lote_id: loteId,
          estado_anterior: null,
          estado_nuevo: 'disponible' as BatchStatus,
          fecha_cambio: lote.created_at || '',
          created_at: lote.created_at || ''
        }
      ];

      // Si el lote fue actualizado y tiene un estado diferente a disponible, agregar ese cambio
      if (lote.estado !== 'disponible' && lote.updated_at !== lote.created_at) {
        mockHistory.push({
          id: '2',
          lote_id: loteId,
          estado_anterior: 'disponible' as BatchStatus,
          estado_nuevo: lote.estado,
          fecha_cambio: lote.updated_at || '',
          created_at: lote.updated_at || ''
        });
      }

      setHistory(mockHistory);
    } catch (error) {
      console.error('Error fetching status history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial de Estados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de Estados
        </CardTitle>
        <CardDescription>
          Registro de todos los cambios de estado de este lote
        </CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No hay cambios de estado registrados
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((change, index) => (
              <div key={change.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {change.estado_anterior && (
                      <>
                        <Badge variant="outline" className="text-xs">
                          {STATUS_LABELS[change.estado_anterior]}
                        </Badge>
                        <span className="text-gray-400">→</span>
                      </>
                    )}
                    <Badge className={STATUS_COLORS[change.estado_nuevo] + " text-xs"}>
                      {STATUS_LABELS[change.estado_nuevo]}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(change.fecha_cambio)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
