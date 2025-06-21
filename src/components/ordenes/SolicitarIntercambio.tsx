
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OrdenForm } from './OrdenForm';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare } from 'lucide-react';

interface SolicitarIntercambioProps {
  tipo_item: 'lote' | 'producto';
  item_id: string;
  proveedor_id: string;
  disabled?: boolean;
}

export const SolicitarIntercambio: React.FC<SolicitarIntercambioProps> = ({
  tipo_item,
  item_id,
  proveedor_id,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Don't show button if user is the owner
  if (user?.id === proveedor_id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={disabled} className="w-full">
          <MessageSquare className="w-4 h-4 mr-2" />
          Solicitar Intercambio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Intercambio</DialogTitle>
        </DialogHeader>
        <OrdenForm
          tipo_item={tipo_item}
          item_id={item_id}
          proveedor_id={proveedor_id}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
