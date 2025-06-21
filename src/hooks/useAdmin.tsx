
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Lote = Database['public']['Tables']['lotes']['Row'];
type Producto = Database['public']['Tables']['productos']['Row'];
type Calificacion = Database['public']['Tables']['calificaciones']['Row'];
type Orden = Database['public']['Tables']['ordenes']['Row'];
type AuditoriaAdmin = Database['public']['Tables']['auditoria_admin']['Row'];

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaAdmin[]>([]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        setIsAdmin(profile?.is_admin || false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const fetchAllData = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all lotes
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all productos
      const { data: productosData } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all calificaciones
      const { data: calificacionesData } = await supabase
        .from('calificaciones')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch all ordenes
      const { data: ordenesData } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch audit logs
      const { data: auditoriasData } = await supabase
        .from('auditoria_admin')
        .select('*')
        .order('created_at', { ascending: false });

      setProfiles(profilesData || []);
      setLotes(lotesData || []);
      setProductos(productosData || []);
      setCalificaciones(calificacionesData || []);
      setOrdenes(ordenesData || []);
      setAuditorias(auditoriasData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos administrativos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateEntityStatus = async (
    entityType: string,
    entityId: string,
    newStatus: string,
    notes?: string
  ) => {
    if (!isAdmin) return;

    try {
      let previousStatus = '';
      
      // Get current status
      if (entityType === 'lote') {
        const current = lotes.find(l => l.id === entityId);
        previousStatus = current?.status || 'pendiente';
        
        const { error } = await supabase
          .from('lotes')
          .update({ status: newStatus })
          .eq('id', entityId);
        
        if (error) throw error;
      } else if (entityType === 'producto') {
        const current = productos.find(p => p.id === entityId);
        previousStatus = current?.status || 'pendiente';
        
        const { error } = await supabase
          .from('productos')
          .update({ status: newStatus })
          .eq('id', entityId);
        
        if (error) throw error;
      } else if (entityType === 'usuario') {
        const current = profiles.find(p => p.id === entityId);
        previousStatus = current?.is_active ? 'activo' : 'suspendido';
        
        const { error } = await supabase
          .from('profiles')
          .update({ is_active: newStatus === 'activo' })
          .eq('id', entityId);
        
        if (error) throw error;
      }

      // Log the action
      await supabase
        .from('auditoria_admin')
        .insert({
          admin_id: user!.id,
          entity_type: entityType,
          entity_id: entityId,
          action: newStatus,
          previous_status: previousStatus,
          new_status: newStatus,
          notes: notes
        });

      toast({
        title: "Acción completada",
        description: `Estado actualizado a: ${newStatus}`,
      });

      // Refresh data
      await fetchAllData();
    } catch (error: any) {
      console.error('Error updating entity status:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    isAdmin,
    loading,
    profiles,
    lotes,
    productos,
    calificaciones,
    ordenes,
    auditorias,
    fetchAllData,
    updateEntityStatus
  };
};
