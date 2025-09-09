import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type GuiaType = 'video' | 'articulo' | 'infografia';
export type GuiaCategoria = 'compostaje' | 'reciclaje' | 'reduccion' | 'reutilizacion' | 'sostenibilidad';
export type GuiaNivel = 'principiante' | 'intermedio' | 'avanzado';

export interface Guia {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  tipo: GuiaType;
  categoria: GuiaCategoria;
  portada_url: string | null;
  video_url: string | null;
  imagenes: string[];
  autor_id: string;
  tags: string[];
  tiempo_lectura: number | null;
  nivel: GuiaNivel;
  activa: boolean;
  destacada: boolean;
  vistas: number;
  created_at: string;
  updated_at: string;
}

interface UseGuiasFilters {
  categoria?: GuiaCategoria;
  tipo?: GuiaType;
  nivel?: GuiaNivel;
  search?: string;
  destacadas?: boolean;
}

export const useGuias = (filters: UseGuiasFilters = {}) => {
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const pageSize = 12;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guias = [], isLoading, error } = useQuery({
    queryKey: ['guias', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('guias')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      
      if (filters.nivel) {
        query = query.eq('nivel', filters.nivel);
      }
      
      if (filters.destacadas) {
        query = query.eq('destacada', true);
      }
      
      if (filters.search) {
        query = query.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setHasNextPage(data.length === pageSize);
      return data as Guia[];
    },
  });

  const { data: allGuias = [] } = useQuery({
    queryKey: ['guias-all', filters],
    queryFn: async () => {
      let query = supabase
        .from('guias')
        .select('*')
        .eq('activa', true)
        .order('created_at', { ascending: false });

      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }
      
      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      
      if (filters.nivel) {
        query = query.eq('nivel', filters.nivel);
      }
      
      if (filters.destacadas) {
        query = query.eq('destacada', true);
      }
      
      if (filters.search) {
        query = query.or(`titulo.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%,tags.cs.{${filters.search}}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Guia[];
    },
    enabled: page === 0,
  });

  const createGuiaMutation = useMutation({
    mutationFn: async (newGuia: Omit<Guia, 'id' | 'created_at' | 'updated_at' | 'vistas'>) => {
      const { data, error } = await supabase
        .from('guias')
        .insert([newGuia])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guias'] });
      toast({
        title: "Guía creada",
        description: "La guía se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la guía. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const updateGuiaMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Guia> & { id: string }) => {
      const { data, error } = await supabase
        .from('guias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guias'] });
      toast({
        title: "Guía actualizada",
        description: "La guía se ha actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la guía.",
        variant: "destructive",
      });
    },
  });

  const incrementViewsMutation = useMutation({
    mutationFn: async (guiaId: string) => {
      const { error } = await supabase.rpc('increment_guia_views', { guia_id: guiaId });
      if (error) throw error;
    },
  });

  const loadNextPage = () => {
    if (hasNextPage && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const resetFilters = () => {
    setPage(0);
    setHasNextPage(true);
  };

  useEffect(() => {
    resetFilters();
  }, [filters.categoria, filters.tipo, filters.nivel, filters.search, filters.destacadas]);

  return {
    guias: page === 0 ? allGuias : guias,
    isLoading,
    error,
    hasNextPage,
    loadNextPage,
    createGuia: createGuiaMutation.mutate,
    updateGuia: updateGuiaMutation.mutate,
    incrementViews: incrementViewsMutation.mutate,
    isCreating: createGuiaMutation.isPending,
    isUpdating: updateGuiaMutation.isPending,
  };
};