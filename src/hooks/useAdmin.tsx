
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
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [auditorias, setAuditorias] = useState<AuditoriaAdmin[]>([]);

  // Combined loading state for UI
  const loading = checkingAdmin || loadingData;

  useEffect(() => {
    const initializeAdmin = async () => {
      console.log('Initializing admin check:', { user: user?.id, authLoading });
      
      // Wait for auth to complete
      if (authLoading) {
        console.log('Auth still loading, waiting...');
        return;
      }

      if (!user) {
        console.log('No user found, setting isAdmin to false');
        setIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }

      try {
        console.log('Fetching profile for user:', user.id);
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setIsAdmin(false);
        } else {
          console.log('Profile fetched:', profile);
          const adminStatus = profile?.is_admin || false;
          console.log('Setting isAdmin to:', adminStatus);
          setIsAdmin(adminStatus);

          // If user is admin and data hasn't been loaded yet, fetch data
          if (adminStatus && !dataLoaded) {
            console.log('User is admin, fetching all data...');
            await fetchAllData();
          }
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    initializeAdmin();
  }, [user, authLoading, dataLoaded]);

  const fetchAllData = async () => {
    if (loadingData) {
      console.log('Data already loading, skipping...');
      return;
    }

    console.log('Starting to fetch all admin data...');
    setLoadingData(true);
    
    try {
      // Fetch all profiles
      console.log('Fetching profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        console.log('Profiles fetched:', profilesData?.length || 0);
      }

      // Fetch all lotes
      console.log('Fetching lotes...');
      const { data: lotesData, error: lotesError } = await supabase
        .from('lotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (lotesError) {
        console.error('Error fetching lotes:', lotesError);
      } else {
        console.log('Lotes fetched:', lotesData?.length || 0);
      }

      // Fetch all productos
      console.log('Fetching productos...');
      const { data: productosData, error: productosError } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (productosError) {
        console.error('Error fetching productos:', productosError);
      } else {
        console.log('Productos fetched:', productosData?.length || 0);
      }

      // Fetch all calificaciones
      console.log('Fetching calificaciones...');
      const { data: calificacionesData, error: calificacionesError } = await supabase
        .from('calificaciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (calificacionesError) {
        console.error('Error fetching calificaciones:', calificacionesError);
      } else {
        console.log('Calificaciones fetched:', calificacionesData?.length || 0);
      }

      // Fetch all ordenes
      console.log('Fetching ordenes...');
      const { data: ordenesData, error: ordenesError } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordenesError) {
        console.error('Error fetching ordenes:', ordenesError);
      } else {
        console.log('Ordenes fetched:', ordenesData?.length || 0);
      }

      // Fetch audit logs
      console.log('Fetching auditorias...');
      const { data: auditoriasData, error: auditoriasError } = await supabase
        .from('auditoria_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (auditoriasError) {
        console.error('Error fetching auditorias:', auditoriasError);
      } else {
        console.log('Auditorias fetched:', auditoriasData?.length || 0);
      }

      setProfiles(profilesData || []);
      setLotes(lotesData || []);
      setProductos(productosData || []);
      setCalificaciones(calificacionesData || []);
      setOrdenes(ordenesData || []);
      setAuditorias(auditoriasData || []);
      setDataLoaded(true);

      console.log('All admin data fetched successfully');
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos administrativos",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
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
      setDataLoaded(false);
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
