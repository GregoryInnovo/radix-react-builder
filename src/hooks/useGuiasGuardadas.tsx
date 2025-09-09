import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useGuiasGuardadas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: guiasGuardadas = [], isLoading } = useQuery({
    queryKey: ['guias-guardadas', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('guias_guardadas')
        .select(`
          id,
          guia_id,
          created_at,
          guias:guia_id (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const isGuardada = (guiaId: string) => {
    return guiasGuardadas.some(item => item.guia_id === guiaId);
  };

  const guardarGuiaMutation = useMutation({
    mutationFn: async (guiaId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('guias_guardadas')
        .insert([{ user_id: user.id, guia_id: guiaId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guias-guardadas'] });
      toast({
        title: "Guía guardada",
        description: "La guía se ha añadido a tus favoritos.",
      });
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast({
          title: "Ya guardada",
          description: "Esta guía ya está en tus favoritos.",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la guía.",
          variant: "destructive",
        });
      }
    },
  });

  const removerGuiaMutation = useMutation({
    mutationFn: async (guiaId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      
      const { error } = await supabase
        .from('guias_guardadas')
        .delete()
        .eq('user_id', user.id)
        .eq('guia_id', guiaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guias-guardadas'] });
      toast({
        title: "Guía removida",
        description: "La guía se ha quitado de tus favoritos.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo remover la guía.",
        variant: "destructive",
      });
    },
  });

  const toggleGuardada = (guiaId: string) => {
    if (!user?.id) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para guardar guías.",
        variant: "destructive",
      });
      return;
    }

    if (isGuardada(guiaId)) {
      removerGuiaMutation.mutate(guiaId);
    } else {
      guardarGuiaMutation.mutate(guiaId);
    }
  };

  return {
    guiasGuardadas,
    isLoading,
    isGuardada,
    toggleGuardada,
    isToggling: guardarGuiaMutation.isPending || removerGuiaMutation.isPending,
  };
};