
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Notificacion = Database['public']['Tables']['notificaciones']['Row'];

export const useNotificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchNotificaciones = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificaciones(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id);

      if (error) throw error;
      await fetchNotificaciones();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user?.id)
        .eq('leida', false);

      if (error) throw error;
      await fetchNotificaciones();
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    fetchNotificaciones();
  }, [user]);

  const unreadCount = notificaciones.filter(n => !n.leida).length;

  return {
    notificaciones,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refreshNotificaciones: fetchNotificaciones
  };
};
