import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useOrdenes } from '@/hooks/useOrdenes';
import { RequestLimitWarning } from './RequestLimitWarning';
import { ShoppingCart, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface ReservarLoteProps {
  lote: Lote;
  disabled?: boolean;
  className?: string;
}

export const ReservarLote: React.FC<ReservarLoteProps> = ({
  lote,
  disabled = false,
  className
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const { user } = useAuth();
  const { createOrden, getRequestCount } = useOrdenes();

  useEffect(() => {
    const fetchRequestCount = async () => {
      const count = await getRequestCount(lote.id);
      setRequestCount(count);
    };
    fetchRequestCount();
  }, [lote.id, getRequestCount]);

  // Don't show button if user is the owner
  if (user?.id === lote.user_id) {
    return null;
  }

  // Only show if lote is available
  if (lote.estado !== 'disponible') {
    return null;
  }

  const handleReservar = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await createOrden({
        proveedor_id: lote.user_id,
        tipo_item: 'lote' as const,
        item_id: lote.id,
        cantidad_solicitada: lote.peso_estimado,
        mensaje_solicitud: `Solicitud de reserva para lote de ${lote.peso_estimado} kg`
      });

      if (result.data) {
        setShowConfirmDialog(false);
      }
    } catch (error) {
      console.error('Error al reservar lote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <RequestLimitWarning
        requestCount={requestCount}
        itemType="lote"
        onConfirm={() => setShowConfirmDialog(true)}
        disabled={disabled || loading}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Reservar Lote
      </RequestLimitWarning>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Confirmar Reserva de Lote
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                ¿Estás seguro de que deseas reservar este lote de {lote.peso_estimado} kg?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Al confirmar, se enviará una solicitud de reserva al generador del lote. 
                  La reserva estará pendiente hasta que el generador la apruebe.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReservar}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};