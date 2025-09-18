
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Orden = Database['public']['Tables']['ordenes']['Row'];
type OrdenInsert = Database['public']['Tables']['ordenes']['Insert'];
type OrdenUpdate = Database['public']['Tables']['ordenes']['Update'];

export const useOrdenes = () => {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrdenes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdenes(data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error al cargar órdenes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingOrders = async (proveedor_id: string, item_id: string) => {
    if (!user) return 0;
    
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .select('id')
        .eq('solicitante_id', user.id)
        .eq('proveedor_id', proveedor_id)
        .eq('item_id', item_id)
        .in('estado', ['pendiente', 'aceptada']);
      
      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error checking existing orders:', error);
      return 0;
    }
  };

  const createOrden = async (ordenData: Omit<OrdenInsert, 'solicitante_id'>, skipConfirmation = false) => {
    if (!user) return { data: null, error: new Error('Usuario no autenticado') };

    // Check for existing orders only for non-lot items or when not skipping confirmation
    if (ordenData.tipo_item !== 'lote') {
      const existingOrdersCount = await checkExistingOrders(ordenData.proveedor_id, ordenData.item_id);
      
      if (existingOrdersCount > 0 && !skipConfirmation) {
        return { 
          data: null, 
          error: null, 
          requiresConfirmation: true, 
          existingOrdersCount 
        };
      }
    }

    try {
      const { data, error } = await supabase
        .from('ordenes')
        .insert({
          ...ordenData,
          solicitante_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to provider
      try {
        await supabase.functions.invoke('notify-order-status', {
          body: {
            ordenId: data.id,
            newStatus: 'pendiente',
            notificationType: 'new_request'
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Don't fail the order creation if notification fails
      }

      // If this is a lot reservation, update the lot status to 'reservado'
      if (ordenData.tipo_item === 'lote') {
        const { error: updateError } = await supabase
          .from('lotes')
          .update({ estado: 'reservado' })
          .eq('id', ordenData.item_id);

        if (updateError) {
          console.error('Error updating lot status:', updateError);
        }
      }

      const messageType = ordenData.tipo_item === 'lote' ? 'reserva' : 'intercambio';
      
      toast({
        title: `Solicitud de ${messageType} enviada`,
        description: `Tu solicitud de ${messageType} ha sido enviada correctamente.`,
      });

      await fetchOrdenes();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast({
        title: "Error al crear solicitud",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateOrden = async (id: string, updates: OrdenUpdate) => {
    try {
      const { data, error } = await supabase
        .from('ordenes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Get current order to determine notification type
      const currentOrden = ordenes.find(o => o.id === id);
      
      // Send appropriate notification
      if (updates.estado && currentOrden) {
        let notificationType = 'status_change';
        if (updates.estado === 'completada') {
          notificationType = 'completed';
        }
        
        try {
          await supabase.functions.invoke('notify-order-status', {
            body: {
              ordenId: id,
              newStatus: updates.estado,
              oldStatus: currentOrden.estado,
              notificationType
            }
          });
        } catch (notificationError) {
          console.error('Error sending status notification:', notificationError);
          // Don't fail the update if notification fails
        }
      }

      const statusMessages = {
        aceptada: "Solicitud aceptada correctamente",
        cancelada: "Solicitud cancelada",
        completada: "Orden marcada como completada"
      };

      const message = statusMessages[updates.estado as keyof typeof statusMessages] || "Orden actualizada";

      toast({
        title: "Orden actualizada",
        description: message,
      });

      await fetchOrdenes();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast({
        title: "Error al actualizar orden",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, [user]);

  // Filter orders by role
  const ordenesComoSolicitante = ordenes.filter(orden => orden.solicitante_id === user?.id);
  const ordenesComoProveedor = ordenes.filter(orden => orden.proveedor_id === user?.id);

  return {
    ordenes,
    ordenesComoSolicitante,
    ordenesComoProveedor,
    loading,
    createOrden,
    updateOrden,
    checkExistingOrders,
    refreshOrdenes: fetchOrdenes
  };
};
