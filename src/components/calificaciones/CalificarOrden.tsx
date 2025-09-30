
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
  const [ratingStatus, setRatingStatus] = useState<{ canRate: boolean; hasRated: boolean }>({ canRate: false, hasRated: false });
  const { canRateOrder } = useCalificaciones();
  const { user } = useAuth();

  const checkRatingStatus = async () => {
    if (!user || !orden.calificado_id) return;
    
    const result = await canRateOrder(orden.id, orden.calificado_id);
    setRatingStatus(result);
  };

  useEffect(() => {
    if (user && orden.estado === 'completada') {
      checkRatingStatus();
    }
  }, [orden.id, orden.estado, orden.calificado_id, user, canRateOrder]);

  const handleSuccess = () => {
    setOpen(false);
    // Update rating status to reflect that user has now rated
    setRatingStatus({ canRate: false, hasRated: true });
  };

  if (orden.estado !== 'completada' || !orden.calificado_id) {
    return null;
  }

  // Show "Ya has calificado" badge if user has already rated
  if (ratingStatus.hasRated) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
        <Star className="w-4 h-4 text-green-600 fill-green-600" />
        <span className="text-sm font-medium text-green-700">Ya has calificado</span>
      </div>
    );
  }

  // Show rating button if user can rate
  if (!ratingStatus.canRate) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-auto px-4">
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
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
