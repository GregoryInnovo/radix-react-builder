import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface CancelarOrdenModalProps {
  isOpen: boolean;
  onConfirm: (mensaje: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CancelarOrdenModal: React.FC<CancelarOrdenModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const [mensaje, setMensaje] = useState('');

  const handleConfirm = async () => {
    await onConfirm(mensaje);
    setMensaje(''); // Reset message after confirmation
  };

  const handleCancel = () => {
    setMensaje(''); // Reset message on cancel
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isLoading && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Orden</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          <Label htmlFor="mensaje">Motivo de cancelación (opcional)</Label>
          <Textarea
            id="mensaje"
            placeholder="Ej: No puedo cumplir con la fecha de entrega..."
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            No
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Sí, Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
