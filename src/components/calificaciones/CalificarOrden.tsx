
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalificacionForm } from './CalificacionForm';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { useAuth } from '@/hooks/useAuth';
import { Star } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Orden = Database['public']['Tables']['ordenes']['Row'];

interface CalificarOrdenProps {
  orden: Orden;
}

export const CalificarOrden: React.FC<CalificarOrdenProps> = ({ orden }) => {
  const [open, setOpen] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const { canRateOrder } = useCalificaciones();
  const { user } = useAuth();

  useEffect(() => {
    const checkCanRate = async () => {
      const result = await canRateOrder(orden.id);
      setCanRate(result);
    };

    if (user && orden.estado === 'completada') {
      checkCanRate();
    }
  }, [orden.id, orden.estado, user, canRateOrder]);

  if (!canRate || orden.estado !== 'completada') {
    return null;
  }

  // Determine who to rate (the other party in the transaction)
  const calificadoId = orden.solicitante_id === user?.id ? orden.proveedor_id : orden.solicitante_id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Star className="w-4 h-4 mr-2" />
          Calificar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Calificar Intercambio</DialogTitle>
        </DialogHeader>
        <CalificacionForm
          ordenId={orden.id}
          calificadoId={calificadoId}
          productoId={orden.tipo_item === 'producto' ? orden.item_id : undefined}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
