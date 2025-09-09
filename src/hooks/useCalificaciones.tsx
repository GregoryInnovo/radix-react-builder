
import { useState, useEffect, useCallback } from 'react';
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

  const getUserRating = useCallback(async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase.rpc('get_user_average_rating', { user_id: userId });
      return data || 0;
    } catch (error) {
      console.error('Error getting user rating:', error);
      return 0;
    }
  }, []);

  const getUserRatingCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const { data } = await supabase.rpc('get_user_rating_count', { user_id: userId });
      return data || 0;
    } catch (error) {
      console.error('Error getting user rating count:', error);
      return 0;
    }
  }, []);

  const getCalificacionesByUser = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // First, get all calificaciones for the user
      const { data: calificacionesData, error: calificacionesError } = await supabase
        .from('calificaciones')
        .select('*')
        .eq('calificado_id', userId)
        .eq('reportada', false)
        .eq('oculta', false)
        .order('created_at', { ascending: false });

      if (calificacionesError) throw calificacionesError;

      if (!calificacionesData || calificacionesData.length === 0) {
        setCalificaciones([]);
        return [];
      }

      // Get unique calificador IDs
      const calificadorIds = [...new Set(calificacionesData.map(c => c.calificador_id))];
      
      // Get unique orden IDs
      const ordenIds = [...new Set(calificacionesData.map(c => c.orden_id))];

      // Fetch profiles and ordenes separately
      const [profilesResponse, ordenesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', calificadorIds),
        supabase
          .from('ordenes')
          .select('id, tipo_item, created_at')
          .in('id', ordenIds)
      ]);

      // Create lookup maps
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.id, p]) || []);
      const ordenesMap = new Map(ordenesResponse.data?.map(o => [o.id, o]) || []);

      // Enrich calificaciones with profile and orden data
      const enrichedData = calificacionesData.map(calificacion => ({
        ...calificacion,
        calificador: profilesMap.get(calificacion.calificador_id) || null,
        orden: ordenesMap.get(calificacion.orden_id) || null
      }));

      setCalificaciones(enrichedData);
      return enrichedData;
    } catch (error: any) {
      console.error('Error fetching ratings:', error);
      setCalificaciones([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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

  const reportarCalificacion = async (calificacionId: string, motivo: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('calificaciones')
      .update({ reportada: true })
      .eq('id', calificacionId);

    if (error) throw error;
  };

  const getCalificacionesRecientes = useCallback(async (userId: string, limit: number = 3) => {
    try {
      // First, get recent calificaciones with comments
      const { data: calificacionesData, error: calificacionesError } = await supabase
        .from('calificaciones')
        .select('*')
        .eq('calificado_id', userId)
        .eq('reportada', false)
        .eq('oculta', false)
        .not('comentario', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (calificacionesError) throw calificacionesError;

      if (!calificacionesData || calificacionesData.length === 0) {
        return [];
      }

      // Get unique calificador IDs and orden IDs
      const calificadorIds = [...new Set(calificacionesData.map(c => c.calificador_id))];
      const ordenIds = [...new Set(calificacionesData.map(c => c.orden_id))];

      // Fetch profiles and ordenes separately
      const [profilesResponse, ordenesResponse] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', calificadorIds),
        supabase
          .from('ordenes')
          .select('id, tipo_item, created_at')
          .in('id', ordenIds)
      ]);

      // Create lookup maps
      const profilesMap = new Map(profilesResponse.data?.map(p => [p.id, p]) || []);
      const ordenesMap = new Map(ordenesResponse.data?.map(o => [o.id, o]) || []);

      // Enrich calificaciones with profile and orden data
      return calificacionesData.map(calificacion => ({
        ...calificacion,
        calificador: profilesMap.get(calificacion.calificador_id) || null,
        orden: ordenesMap.get(calificacion.orden_id) || null
      }));
    } catch (error) {
      console.error('Error fetching recent ratings:', error);
      return [];
    }
  }, []);

  const hideCalificacion = async (calificacionId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('calificaciones')
      .update({ oculta: true })
      .eq('id', calificacionId);

    if (error) throw error;
  };

  const unhideCalificacion = async (calificacionId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('calificaciones')
      .update({ oculta: false })
      .eq('id', calificacionId);

    if (error) throw error;
  };

  const dismissReport = async (calificacionId: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('calificaciones')
      .update({ reportada: false })
      .eq('id', calificacionId);

    if (error) throw error;
  };

  const getReportedCalificaciones = async () => {
    const { data, error } = await supabase
      .from('calificaciones')
      .select(`
        *,
        calificador:profiles!calificaciones_calificador_id_fkey(full_name),
        calificado:profiles!calificaciones_calificado_id_fkey(full_name),
        orden:ordenes!calificaciones_orden_id_fkey(tipo_item)
      `)
      .eq('reportada', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  return {
    calificaciones,
    loading,
    createCalificacion,
    canRateOrder,
    getUserRating,
    getUserRatingCount,
    getCalificacionesByUser,
    deleteCalificacion,
    reportarCalificacion,
    getCalificacionesRecientes,
    hideCalificacion,
    unhideCalificacion,
    dismissReport,
    getReportedCalificaciones
  };
};
