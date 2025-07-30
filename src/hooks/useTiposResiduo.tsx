
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type TipoResiduo = {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

export const useTiposResiduo = () => {
  const [tiposResiduos, setTiposResiduos] = useState<TipoResiduo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTiposResiduos = async () => {
    setLoading(true);
    try {
      console.log('Fetching tipos residuo...');
      
      const { data, error } = await supabase
        .from('tipos_residuo')
        .select('*')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      console.log('Tipos residuo result:', { data, error });

      if (error) throw error;
      
      const typedData = data as TipoResiduo[];
      setTiposResiduos(typedData || []);
      console.log('Tipos residuo loaded:', typedData?.length || 0);
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
