
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'];
type CalificacionInsert = Database['public']['Tables']['calificaciones']['Insert'];

export const useCalificaciones = () => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createCalificacion = async (calificacionData: Omit<CalificacionInsert, 'calificador_id'>) => {
    if (!user) return { data: null, error: new Error('Usuario no autenticado') };

    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .insert({
          ...calificacionData,
          calificador_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Calificación enviada",
        description: "Tu calificación ha sido registrada correctamente.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating rating:', error);
      toast({
        title: "Error al enviar calificación",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const canRateOrder = async (ordenId: string, calificadoId?: string): Promise<boolean> => {
    if (!user || !calificadoId) return false;

    try {
      // Check if user already rated this specific person for this order  
      const { data: existingRating } = await supabase
        .from('calificaciones')
        .select('id')
        .eq('calificador_id', user.id)
        .eq('orden_id', ordenId)
        .eq('calificado_id', calificadoId)
        .single();

      // If rating exists, user cannot rate again
      if (existingRating) return false;

      // Check if order is completed and user participated
      const { data: orden } = await supabase
        .from('ordenes')
        .select('estado, solicitante_id, proveedor_id')
        .eq('id', ordenId)
        .single();

      if (!orden || orden.estado !== 'completada') return false;

      // User must be either requester or provider
      const userParticipated = orden.solicitante_id === user.id || orden.proveedor_id === user.id;
      
      return userParticipated;
    } catch (error) {
      console.error('Error checking if can rate:', error);
      return false;
    }
  };

  const getUserRating = async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase.rpc('get_user_average_rating', { user_id: userId });
      return data || 0;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return 0;
    }
  };

  const getUserRatingCount = async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase.rpc('get_user_rating_count', { user_id: userId });
      return data || 0;
    } catch (error) {
      console.error('Error getting user rating count:', error);
      return 0;
    }
  };

  const getCalificacionesByUser = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select(`
          *,
          calificador:calificador_id(full_name),
          orden:orden_id(*)
        `)
        .eq('calificado_id', userId)
        .eq('reportada', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCalificaciones(data || []);
      return data || [];
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteCalificacion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calificaciones')
        .delete()
        .eq('id', id)
        .eq('calificador_id', user?.id);

      if (error) throw error;

      toast({
        title: "Calificación eliminada",
        description: "La calificación ha sido eliminada correctamente.",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Error al eliminar calificación",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    calificaciones,
    loading,
    createCalificacion,
    canRateOrder,
    getUserRating,
    getUserRatingCount,
    getCalificacionesByUser,
    deleteCalificacion
  };
};
