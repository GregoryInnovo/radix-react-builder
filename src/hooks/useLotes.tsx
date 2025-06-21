
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type LoteInsert = Database['public']['Tables']['lotes']['Insert'];
type LoteUpdate = Database['public']['Tables']['lotes']['Update'];
type BatchStatus = Database['public']['Enums']['batch_status'];

export const useLotes = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchLotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLotes(data || []);
    } catch (error: any) {
      console.error('Error fetching lotes:', error);
      toast({
        title: "Error al cargar lotes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLote = async (loteData: Omit<LoteInsert, 'user_id'>) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotes')
        .insert({
          ...loteData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Lote creado exitosamente!",
        description: "Tu lote de ROA ha sido registrado.",
      });

      await fetchLotes();
      return data;
    } catch (error: any) {
      console.error('Error creating lote:', error);
      toast({
        title: "Error al crear lote",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLote = async (id: string, updates: LoteUpdate) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lote actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      await fetchLotes();
      return data;
    } catch (error: any) {
      console.error('Error updating lote:', error);
      toast({
        title: "Error al actualizar lote",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateLoteStatus = async (id: string, newStatus: BatchStatus) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotes')
        .update({ estado: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Aquí se podría llamar a una Edge Function para enviar notificaciones
      // await notifyStatusChange(id, newStatus);

      await fetchLotes();
      return data;
    } catch (error: any) {
      console.error('Error updating lote status:', error);
      toast({
        title: "Error al cambiar estado",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLote = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('lotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Lote eliminado",
        description: "El lote ha sido eliminado exitosamente.",
      });

      await fetchLotes();
    } catch (error: any) {
      console.error('Error deleting lote:', error);
      toast({
        title: "Error al eliminar lote",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLotes();
  }, [user]);

  return {
    lotes,
    loading,
    createLote,
    updateLote,
    updateLoteStatus,
    deleteLote,
    refreshLotes: fetchLotes,
  };
};
