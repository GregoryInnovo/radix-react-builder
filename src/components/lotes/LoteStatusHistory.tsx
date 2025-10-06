
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
  tipo: 'batch_status' | 'admin_action';
  accion?: string;
  notas?: string;
}

interface LoteStatusHistoryProps {
  loteId: string;
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

export const LoteStatusHistory = ({ loteId }: LoteStatusHistoryProps) => {
  const [history, setHistory] = useState<StatusChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusHistory();
  }, [loteId]);

  const fetchStatusHistory = async () => {
    try {
      // Query 1: Batch status changes from lotes_historial
      const { data: historialData, error: historialError } = await supabase
        .from('lotes_historial')
        .select('id, lote_id, estado_anterior, estado_nuevo, created_at, notas')
        .eq('lote_id', loteId)
        .order('created_at', { ascending: true });

      if (historialError) throw historialError;

      // Query 2: Admin actions from auditoria_admin (aprobado, rechazado)
      const { data: auditoriaData, error: auditoriaError } = await supabase
        .from('auditoria_admin')
        .select('id, entity_id, action, previous_status, new_status, notes, created_at')
        .eq('entity_id', loteId)
        .eq('entity_type', 'lote')
        .order('created_at', { ascending: true });

      if (auditoriaError) throw auditoriaError;

      // Combine both histories
      const combinedHistory: StatusChange[] = [];

      // Add batch status changes
      if (historialData && historialData.length > 0) {
        historialData.forEach(item => {
          combinedHistory.push({
            id: item.id,
            lote_id: item.lote_id,
            estado_anterior: item.estado_anterior,
            estado_nuevo: item.estado_nuevo,
            fecha_cambio: item.created_at,
            created_at: item.created_at,
            tipo: 'batch_status',
            notas: item.notas || undefined
          });
        });
      }

      // Add admin actions
      if (auditoriaData && auditoriaData.length > 0) {
        auditoriaData.forEach(item => {
          combinedHistory.push({
            id: item.id,
            lote_id: loteId,
            estado_anterior: null,
            estado_nuevo: null as any,
            fecha_cambio: item.created_at || '',
            created_at: item.created_at || '',
            tipo: 'admin_action',
            accion: item.action,
            notas: item.notes || undefined
          });
        });
      }

      // Sort by date (oldest first)
      combinedHistory.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // If no history at all, get lote creation info
      if (combinedHistory.length === 0) {
        const { data: lote, error: loteError } = await supabase
          .from('lotes')
          .select('created_at, estado, status')
          .eq('id', loteId)
          .single();

        if (loteError) throw loteError;

        const initialHistory: StatusChange[] = [{
          id: 'creation',
          lote_id: loteId,
          estado_anterior: null,
          estado_nuevo: lote.estado,
          fecha_cambio: lote.created_at || '',
          created_at: lote.created_at || '',
          tipo: 'batch_status'
        }];

        setHistory(initialHistory);
      } else {
        setHistory(combinedHistory);
      }
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
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'status_change': 'Cambio de Estado'
    };
    return labels[action] || action;
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
              <div key={change.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex-1">
                  {change.tipo === 'batch_status' ? (
                    <>
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
                      <p className="text-xs text-gray-500 font-medium">
                        {formatDate(change.fecha_cambio)}
                      </p>
                      {change.notas && (
                        <p className="text-xs text-gray-600 mt-1 italic">
                          {change.notas}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          className={
                            change.accion === 'approved' 
                              ? 'bg-green-100 text-green-800 text-xs' 
                              : change.accion === 'rejected'
                              ? 'bg-red-100 text-red-800 text-xs'
                              : 'bg-blue-100 text-blue-800 text-xs'
                          }
                        >
                          {getActionLabel(change.accion || 'Acción Admin')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {formatDate(change.fecha_cambio)}
                      </p>
                      {change.notas && (
                        <p className="text-xs text-gray-700 mt-2 p-2 bg-amber-50 rounded border-l-2 border-amber-400">
                          <span className="font-semibold">Motivo:</span> {change.notas}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
