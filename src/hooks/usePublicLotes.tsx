import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: Database['public']['Tables']['tipos_residuo']['Row'];
};

export const usePublicLotes = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPublicLotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select(`
          *,
          tipos_residuo (*)
        `)
        .eq('status', 'aprobado')
        .eq('estado', 'disponible')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLotes(data || []);
    } catch (error: any) {
      console.error('Error fetching public lotes:', error);
      toast({
        title: "Error al cargar lotes públicos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicLotes();
  }, []);

  return {
    lotes,
    loading,
    refreshLotes: fetchPublicLotes,
  };
};