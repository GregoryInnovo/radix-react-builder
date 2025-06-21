
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'];
type CalificacionInsert = Database['public']['Tables']['calificaciones']['Insert'];

export const useCalificaciones = () => {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchCalificaciones = async (userId?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('calificaciones')
        .select('*')
        .eq('reportada', false)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('calificado_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCalificaciones(data || []);
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      toast({
        title: "Error al cargar calificaciones",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      await fetchCalificaciones();
      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating rating:', error);
      toast({
        title: "Error al crear calificación",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCalificacion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('calificaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Calificación eliminada",
        description: "La calificación ha sido eliminada correctamente.",
      });

      await fetchCalificaciones();
    } catch (error: any) {
      console.error('Error deleting rating:', error);
      toast({
        title: "Error al eliminar calificación",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserRating = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_average_rating', { user_id: userId });

      if (error) throw error;
      return data || 0;
    } catch (error: any) {
      console.error('Error fetching user rating:', error);
      return 0;
    }
  };

  const getUserRatingCount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_rating_count', { user_id: userId });

      if (error) throw error;
      return data || 0;
    } catch (error: any) {
      console.error('Error fetching user rating count:', error);
      return 0;
    }
  };

  const canRateOrder = async (ordenId: string) => {
    if (!user) return false;

    try {
      // Check if order is completed and user participated
      const { data: orden, error: ordenError } = await supabase
        .from('ordenes')
        .select('*')
        .eq('id', ordenId)
        .eq('estado', 'completada')
        .single();

      if (ordenError || !orden) return false;

      const isParticipant = orden.solicitante_id === user.id || orden.proveedor_id === user.id;
      if (!isParticipant) return false;

      // Check if already rated
      const { data: existingRating, error: ratingError } = await supabase
        .from('calificaciones')
        .select('id')
        .eq('orden_id', ordenId)
        .eq('calificador_id', user.id)
        .single();

      return !existingRating && !ratingError;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    fetchCalificaciones();
  }, [user]);

  return {
    calificaciones,
    loading,
    createCalificacion,
    deleteCalificacion,
    getUserRating,
    getUserRatingCount,
    canRateOrder,
    refreshCalificaciones: fetchCalificaciones
  };
};
