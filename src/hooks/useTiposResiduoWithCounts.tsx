import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type TipoResiduoWithCount = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  lotes_count: number;
};

export const useTiposResiduoWithCounts = () => {
  const [tiposResiduos, setTiposResiduos] = useState<TipoResiduoWithCount[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTiposResiduos = async () => {
    setLoading(true);
    try {
      // Get basic types first
      const { data: basicData, error: basicError } = await supabase
        .from('tipos_residuo')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (basicError) throw basicError;

      // Get counts separately for each type
      const dataWithCounts = await Promise.all(
        (basicData || []).map(async (tipo) => {
          const { count } = await supabase
            .from('lotes')
            .select('*', { count: 'exact', head: true })
            .eq('tipo_residuo_id', tipo.id)
            .eq('estado', 'disponible')
            .eq('status', 'aprobado')
            .is('deleted_at', null);

          return {
            ...tipo,
            lotes_count: count || 0
          };
        })
      );

      setTiposResiduos(dataWithCounts);
    } catch (error: any) {
      console.error('Error fetching tipos residuo with counts:', error);
      toast({
        title: "Error al cargar tipos de residuo",
        description: error.message,
        variant: "destructive",
      });
      setTiposResiduos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiposResiduos();
  }, []);

  return {
    tiposResiduos,
    loading,
    refreshTiposResiduos: fetchTiposResiduos,
  };
};