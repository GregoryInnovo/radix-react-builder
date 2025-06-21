
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

  const createOrden = async (ordenData: Omit<OrdenInsert, 'solicitante_id'>) => {
    if (!user) return { data: null, error: new Error('Usuario no autenticado') };

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

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de intercambio ha sido enviada correctamente.",
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
    refreshOrdenes: fetchOrdenes
  };
};
