
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

      // Fetch all lotes with the join using tipo_residuo_id (excluding deleted)
      console.log('Fetching lotes...');
      const { data: lotesData, error: lotesError } = await supabase
        .from('lotes')
        .select(`
          *,
          tipos_residuo:tipo_residuo_id (
            id,
            nombre,
            descripcion
          )
        `)
        .is('deleted_at', null)
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
          .update({ 
            status: newStatus,
            admin_notes: notes || null
          })
          .eq('id', entityId);
        
        if (error) throw error;

        // Send notification for lote status change
        try {
          await supabase.functions.invoke('notify-status-change', {
            body: {
              loteId: entityId,
              newStatus,
              oldStatus: previousStatus,
              adminNotes: notes
            }
          });
        } catch (notifError) {
          console.error('Error sending lote notification:', notifError);
          // Don't fail the main operation if notification fails
        }
      } else if (entityType === 'producto') {
        const current = productos.find(p => p.id === entityId);
        previousStatus = current?.status || 'pendiente';
        
        const { error } = await supabase
          .from('productos')
          .update({ status: newStatus })
          .eq('id', entityId);
        
        if (error) throw error;

        // Send notification for product status change
        try {
          await supabase.functions.invoke('notify-product-status', {
            body: {
              productId: entityId,
              newStatus,
              oldStatus: previousStatus,
              adminNotes: notes
            }
          });
        } catch (notifError) {
          console.error('Error sending product notification:', notifError);
          // Don't fail the main operation if notification fails
        }
      } else if (entityType === 'usuario') {
        const current = profiles.find(p => p.id === entityId);
        previousStatus = current?.is_active ? 'activo' : 'suspendido';
        
        // Use the edge function for effective suspension
        try {
          await supabase.functions.invoke('suspend-user', {
            body: {
              userId: entityId,
              action: newStatus === 'activo' ? 'restore' : 'suspend',
              adminNotes: notes
            }
          });
        } catch (suspendError) {
          console.error('Error in suspend function:', suspendError);
          // Fallback to direct update
          const { error } = await supabase
            .from('profiles')
            .update({ is_active: newStatus === 'activo' })
            .eq('id', entityId);
          
          if (error) throw error;
        }
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

  const deleteEntity = async (entityType: string, entityId: string, notes?: string) => {
    if (loadingData) {
      console.log('Already deleting, preventing duplicate call');
      return;
    }
    
    setLoadingData(true);
    try {
      // Get entity data for audit before deletion
      let entityData: any = null;
      
      if (entityType === 'lote') {
        const { data } = await supabase
          .from('lotes')
          .select('*')
          .eq('id', entityId)
          .single();
        entityData = data;
        
        // Send notification before soft deletion
        if (entityData) {
          try {
            await supabase.functions.invoke('notify-delete-entity', {
              body: {
                entityType: 'lote',
                entityId,
                ownerId: entityData.user_id,
                entityTitle: `Lote de ${entityData.peso_estimado}kg`,
                adminNotes: notes
              }
            });
          } catch (notifError) {
            console.error('Error sending delete notification:', notifError);
          }
        }
        
        // Soft delete lote using deleted_at timestamp
        const { error: deleteError } = await supabase
          .from('lotes')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', entityId);
        
        if (deleteError) throw deleteError;
      } else if (entityType === 'producto') {
        const { data } = await supabase
          .from('productos')
          .select('*')
          .eq('id', entityId)
          .single();
        entityData = data;
        
        // Send notification before deletion
        if (entityData) {
          try {
            await supabase.functions.invoke('notify-delete-entity', {
              body: {
                entityType: 'producto',
                entityId,
                ownerId: entityData.user_id,
                entityTitle: entityData.nombre,
                adminNotes: notes
              }
            });
          } catch (notifError) {
            console.error('Error sending delete notification:', notifError);
          }
        }
        
        // Hard delete producto (no soft delete for products yet)
        const { error: deleteError } = await supabase
          .from('productos')
          .delete()
          .eq('id', entityId);
        
        if (deleteError) throw deleteError;
      } else {
        throw new Error(`Tipo de entidad no válido para eliminación: ${entityType}`);
      }

      // Log the action in audit table
      const { error: auditError } = await supabase
        .from('auditoria_admin')
        .insert({
          admin_id: user!.id,
          entity_type: entityType,
          entity_id: entityId,
          action: 'delete',
          previous_status: entityData?.status || 'pendiente',
          new_status: 'eliminado',
          notes: notes || `${entityType} eliminado definitivamente por el administrador`
        });

      if (auditError) throw auditError;

      toast({
        title: "Eliminado correctamente",
        description: `El ${entityType} ha sido eliminado definitivamente.`,
      });

      // Refresh data
      setDataLoaded(false);
      await fetchAllData();
    } catch (error: any) {
      console.error('Error deleting entity:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const deleteUserCompletely = async (userId: string, notes?: string) => {
    setLoadingData(true);
    try {
      // Call the edge function to delete user completely
      const { error } = await supabase.functions.invoke('delete-user-completely', {
        body: {
          userId,
          adminNotes: notes
        }
      });

      if (error) throw error;

      // Log the action in audit table
      await supabase
        .from('auditoria_admin')
        .insert({
          admin_id: user!.id,
          entity_type: 'usuario',
          entity_id: userId,
          action: 'delete_completely',
          previous_status: 'existente',
          new_status: 'eliminado_completamente',
          notes: notes || 'Usuario eliminado completamente por el administrador'
        });

      toast({
        title: "Usuario eliminado completamente",
        description: "El usuario y todos sus datos han sido eliminados definitivamente.",
      });

      // Refresh data
      setDataLoaded(false);
      await fetchAllData();
    } catch (error: any) {
      console.error('Error deleting user completely:', error);
      toast({
        title: "Error al eliminar usuario",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
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
    updateEntityStatus,
    deleteEntity,
    deleteUserCompletely
  };
};
