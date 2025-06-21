
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];
type ProductoInsert = Database['public']['Tables']['productos']['Insert'];
type ProductoUpdate = Database['public']['Tables']['productos']['Update'];

export const useProductos = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchProductos = async (onlyUserProducts = false) => {
    setLoading(true);
    try {
      let query = supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (onlyUserProducts && user) {
        query = query.eq('user_id', user.id);
      } else {
        // Only show available products for public view
        query = query.eq('disponible', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProductos(data || []);
    } catch (error: any) {
      console.error('Error fetching productos:', error);
      toast({
        title: "Error al cargar productos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const createProducto = async (productoData: Omit<ProductoInsert, 'user_id'>) => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .insert({
          ...productoData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "¡Producto creado exitosamente!",
        description: "Tu producto ha sido publicado.",
      });

      await fetchProductos();
      return data;
    } catch (error: any) {
      console.error('Error creating producto:', error);
      toast({
        title: "Error al crear producto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProducto = async (id: string, updates: ProductoUpdate) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('productos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Producto actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });

      await fetchProductos();
      return data;
    } catch (error: any) {
      console.error('Error updating producto:', error);
      toast({
        title: "Error al actualizar producto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProducto = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado exitosamente.",
      });

      await fetchProductos();
    } catch (error: any) {
      console.error('Error deleting producto:', error);
      toast({
        title: "Error al eliminar producto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, [user]);

  return {
    productos,
    loading,
    createProducto,
    updateProducto,
    deleteProducto,
    uploadImage,
    refreshProductos: fetchProductos,
  };
};
