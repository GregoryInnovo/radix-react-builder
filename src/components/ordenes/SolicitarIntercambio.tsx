
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { OrdenForm } from './OrdenForm';
import { useAuth } from '@/hooks/useAuth';
import { useOrdenes } from '@/hooks/useOrdenes';
import { RequestLimitWarning } from '@/components/lotes/RequestLimitWarning';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

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
  const [producto, setProducto] = useState<Producto | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const { user } = useAuth();
  const { getRequestCount } = useOrdenes();

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        // Fetch product data if needed
        if (tipo_item === 'producto') {
          const { data } = await supabase
            .from('productos')
            .select('*')
            .eq('id', item_id)
            .single();
          setProducto(data);
        }

        // Fetch request count
        const count = await getRequestCount(item_id);
        setRequestCount(count);
      };
      fetchData();
    }
  }, [tipo_item, item_id, open, getRequestCount]);

  // Don't show button if user is the owner
  if (user?.id === proveedor_id) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <RequestLimitWarning
          requestCount={requestCount}
          itemType={tipo_item}
          onConfirm={() => setOpen(true)}
          disabled={disabled}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Solicitar Intercambio
        </RequestLimitWarning>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Intercambio</DialogTitle>
        </DialogHeader>
        <OrdenForm
          tipo_item={tipo_item}
          item_id={item_id}
          proveedor_id={proveedor_id}
          producto={producto}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
