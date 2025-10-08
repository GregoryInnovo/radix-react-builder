import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Producto = Database["public"]["Tables"]["productos"]["Row"];

export const useOrdenProductos = (productoIds: string[]) => {
  const [productos, setProductos] = useState<Record<string, Producto>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      if (productoIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .in("id", productoIds);

        if (error) throw error;

        const productosMap: Record<string, Producto> = {};
        data?.forEach((producto) => {
          productosMap[producto.id] = producto;
        });

        setProductos(productosMap);
      } catch (error) {
        console.error("Error fetching productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [productoIds.join(",")]);

  const getProductoById = (id: string): Producto | undefined => {
    return productos[id];
  };

  return {
    productos,
    loading,
    getProductoById,
  };
};
