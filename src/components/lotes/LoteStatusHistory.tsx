import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, History } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StatusHistoryEntry {
  id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_accion_id: string | null;
  notas: string | null;
  created_at: string;
  usuario?: {
    full_name: string | null;
  } | null;
}

interface LoteStatusHistoryProps {
  loteId: string;
}

const STATUS_LABELS: Record<string, string> = {
  'disponible': 'Disponible',
  'reservado': 'Reservado',
  'recolectado': 'Recolectado',
  'completado': 'Completado',
  'cancelado': 'Cancelado'
};

const STATUS_COLORS: Record<string, string> = {
  'disponible': 'bg-green-100 text-green-800',
  'reservado': 'bg-orange-100 text-orange-800',
  'recolectado': 'bg-blue-100 text-blue-800',
  'completado': 'bg-purple-100 text-purple-800',
  'cancelado': 'bg-red-100 text-red-800'
};

export const LoteStatusHistory: React.FC<LoteStatusHistoryProps> = ({
  loteId
}) => {
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatusHistory();
  }, [loteId]);

  const fetchStatusHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch status history with user information
      const { data: historyData, error } = await supabase
        .from('lotes_historial')
        .select(`
          id,
          estado_anterior,
          estado_nuevo,
          usuario_accion_id,
          notas,
          created_at
        `)
        .eq('lote_id', loteId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for the history entries
      const userIds = historyData?.map(h => h.usuario_accion_id).filter(Boolean) || [];
      
      let userProfiles: Record<string, { full_name: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        userProfiles = Object.fromEntries(
          (profilesData || []).map(p => [p.id, { full_name: p.full_name }])
        );
      }

      // Combine history with user profiles
      const historyWithUsers = (historyData || []).map(entry => ({
        ...entry,
        usuario: entry.usuario_accion_id ? userProfiles[entry.usuario_accion_id] || null : null
      }));

      setHistory(historyWithUsers);
    } catch (error: any) {
      console.error('Error fetching status history:', error);
      toast({
        title: "Error al cargar historial",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;
  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Historial del Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          Historial del Lote
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status History */}
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay cambios de estado registrados aún</p>
            <p className="text-xs text-gray-400 mt-1">
              El historial aparecerá cuando se realicen cambios en el estado del lote
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry, index) => {
              const { date, time } = formatDate(entry.created_at);
              const isCreation = entry.estado_anterior === null;
              
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 bg-white border rounded-lg relative"
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === history.length - 1 ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                    {index < history.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{date}</span>
                      <span className="text-sm text-gray-500">{time}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {isCreation ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Lote creado con estado:</span>
                          <Badge className={getStatusColor(entry.estado_nuevo)}>
                            {getStatusLabel(entry.estado_nuevo)}
                          </Badge>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(entry.estado_anterior!)}
                          </Badge>
                          <span className="text-sm text-gray-500">→</span>
                          <Badge className={getStatusColor(entry.estado_nuevo)}>
                            {getStatusLabel(entry.estado_nuevo)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {entry.usuario?.full_name && (
                      <div className="text-xs text-gray-500">
                        Por: {entry.usuario.full_name}
                      </div>
                    )}

                    {entry.notas && (
                      <div className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                        {entry.notas}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};