
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
  orden: Orden & { calificado_id?: string };
}

export const CalificarOrden: React.FC<CalificarOrdenProps> = ({ orden }) => {
  const [open, setOpen] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const { canRateOrder } = useCalificaciones();
  const { user } = useAuth();

  useEffect(() => {
    const checkCanRate = async () => {
      if (!user || !orden.calificado_id) return;
      
      const result = await canRateOrder(orden.id, orden.calificado_id);
      setCanRate(result);
    };

    if (user && orden.estado === 'completada') {
      checkCanRate();
    }
  }, [orden.id, orden.estado, orden.calificado_id, user, canRateOrder]);

  if (!canRate || orden.estado !== 'completada' || !orden.calificado_id) {
    return null;
  }

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
          calificadoId={orden.calificado_id}
          productoId={orden.tipo_item === 'producto' ? orden.item_id : undefined}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
