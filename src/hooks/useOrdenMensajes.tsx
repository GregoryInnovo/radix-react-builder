import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type OrdenMensaje = Database['public']['Tables']['orden_mensajes']['Row'];
type OrdenMensajeInsert = Database['public']['Tables']['orden_mensajes']['Insert'];

export const useOrdenMensajes = (ordenId: string) => {
  const [mensajes, setMensajes] = useState<OrdenMensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMensajes = async () => {
    if (!ordenId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orden_mensajes')
        .select('*')
        .eq('orden_id', ordenId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMensajes(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error al cargar mensajes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMensaje = async (mensaje: string) => {
    if (!user || !mensaje.trim()) return { data: null, error: new Error('Mensaje vacío') };

    try {
      const { data, error } = await supabase
        .from('orden_mensajes')
        .insert({
          orden_id: ordenId,
          usuario_id: user.id,
          mensaje: mensaje.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Send notification to the other party
      await supabase.functions.invoke('notify-new-message', {
        body: {
          ordenId,
          senderId: user?.id,
          mensaje
        }
      });

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado correctamente.",
      });

      await fetchMensajes(); // Refresh messages
      return { data, error: null };
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error al enviar mensaje",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [ordenId]);

  return {
    mensajes,
    loading,
    sendMensaje,
    refreshMensajes: fetchMensajes
  };
};