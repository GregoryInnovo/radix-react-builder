
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TipoResiduo = Database['public']['Tables']['tipos_residuo']['Row'];

export const useTiposResiduo = () => {
  const [tiposResiduos, setTiposResiduos] = useState<TipoResiduo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTiposResiduos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tipos_residuo')
        .select('*')
        .eq('activo', true)
        .order('descripcion', { ascending: true });

      if (error) throw error;
      setTiposResiduos(data || []);
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

  useEffect(() => {
    fetchTiposResiduos();
  }, []);

  return {
    tiposResiduos,
    loading,
    refreshTiposResiduos: fetchTiposResiduos,
  };
};
