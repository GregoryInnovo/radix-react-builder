import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useOrdenes } from '@/hooks/useOrdenes';
import { useLotes } from '@/hooks/useLotes';
import { MessageSquare, Calendar, MapPin, Weight, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
};

interface ReservarLoteProps {
  lote: Lote;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const ReservarLote: React.FC<ReservarLoteProps> = ({
  lote,
  disabled = false,
  onSuccess
}) => {
  const [open, setOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { createOrden } = useOrdenes();
  const { updateLoteStatus } = useLotes();

  // Don't show button if user is the owner
  if (user?.id === lote.user_id) {
    return null;
  }

  // Don't show if lote is not available
  if (lote.estado !== 'disponible') {
    return null;
  }

  const handleReservar = () => {
    setOpen(false);
    setShowConfirmation(true);
  };

  const handleConfirmReservation = async () => {
    try {
      setLoading(true);

      // Create order for the lot
      const ordenData = {
        proveedor_id: lote.user_id,
        tipo_item: 'lote' as const,
        item_id: lote.id,
        cantidad_solicitada: lote.peso_estimado,
        fecha_propuesta_retiro: lote.fecha_disponible || undefined,
        mensaje_solicitud: `Solicito reservar este lote de ${lote.tipos_residuo?.nombre || 'ROA'} (${lote.peso_estimado} kg).`
      };

      const orden = await createOrden(ordenData, true);
      
      if (orden) {
        // Update lot status to reserved
        await updateLoteStatus(lote.id, 'reservado');
        
        toast({
          title: "¡Lote reservado exitosamente!",
          description: "Se ha enviado una solicitud al generador. Te notificaremos cuando responda.",
        });

        setShowConfirmation(false);
        onSuccess?.();
      }
    } catch (error: any) {
      console.error('Error reserving lote:', error);
      toast({
        title: "Error al reservar lote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            disabled={disabled} 
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Reservar Lote
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reservar Lote de ROA</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Peso:</span>
                <span>{lote.peso_estimado} kg</span>
              </div>
              
              {lote.tipos_residuo && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Tipo:</span>
                  <Badge variant="secondary">{lote.tipos_residuo.nombre}</Badge>
                </div>
              )}
              
              {lote.fecha_disponible && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Disponible desde:</span>
                  <span className="text-sm">{new Date(lote.fecha_disponible).toLocaleDateString()}</span>
                </div>
              )}
              
              {lote.direccion && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">Ubicación:</span>
                    <p className="text-sm text-gray-600">{lote.direccion}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>¿Qué sucede cuando reservas?</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• El lote cambiará a estado "Reservado"</li>
                <li>• Se enviará una notificación al generador</li>
                <li>• El generador podrá aprobar o rechazar tu solicitud</li>
                <li>• Te notificaremos la respuesta del generador</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleReservar}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar reserva del lote?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción enviará una solicitud de reserva al generador del lote. 
              Una vez confirmada, el lote no estará disponible para otros usuarios 
              hasta que se complete o cancele el intercambio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReservation}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Reservando...' : 'Sí, reservar lote'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};