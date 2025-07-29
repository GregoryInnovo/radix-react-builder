
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

// Tipo temporal para tipos_residuo hasta que se actualicen los tipos de Supabase
type TipoResiduo = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

type TipoResiduoInsert = {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
};

type TipoResiduoUpdate = {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
};

export const useTiposResiduoAdmin = () => {
  const [tiposResiduos, setTiposResiduos] = useState<TipoResiduo[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTiposResiduos = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tipos_residuo' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTiposResiduos((data as unknown as TipoResiduo[]) || []);
    } catch (error: any) {
      console.error('Error fetching tipos residuo:', error);
      toast({
        title: "Error al cargar tipos de residuo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTipoResiduo = async (tipoData: TipoResiduoInsert) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tipos_residuo' as any)
        .insert(tipoData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Tipo de residuo creado exitosamente!",
        description: `Se ha creado el tipo "${tipoData.descripcion || tipoData.nombre}".`,
      });

      await fetchTiposResiduos();
      return data;
    } catch (error: any) {
      console.error('Error creating tipo residuo:', error);
      toast({
        title: "Error al crear tipo de residuo",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTipoResiduo = async (id: string, updates: TipoResiduoUpdate) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tipos_residuo' as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tipo de residuo actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      await fetchTiposResiduos();
      return data;
    } catch (error: any) {
      console.error('Error updating tipo residuo:', error);
      toast({
        title: "Error al actualizar tipo de residuo",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTipoResiduo = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tipos_residuo' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tipo de residuo eliminado",
        description: "El tipo de residuo ha sido eliminado exitosamente.",
      });

      await fetchTiposResiduos();
    } catch (error: any) {
      console.error('Error deleting tipo residuo:', error);
      toast({
        title: "Error al eliminar tipo de residuo",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposResiduos();
  }, [user]);

  return {
    tiposResiduos,
    loading,
    createTipoResiduo,
    updateTipoResiduo,
    deleteTipoResiduo,
    refreshTiposResiduos: fetchTiposResiduos,
  };
};
