import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Lote = Database["public"]["Tables"]["lotes"]["Row"] & {
  tipos_residuo?: Database["public"]["Tables"]["tipos_residuo"]["Row"] | null;
};

export const useOrdenLotes = (loteIds: string[]) => {
  const [lotes, setLotes] = useState<Record<string, Lote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLotes = async () => {
      if (loteIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("lotes")
          .select(`
            *,
            tipos_residuo (*)
          `)
          .in("id", loteIds);

        if (error) throw error;

        const lotesMap: Record<string, Lote> = {};
        data?.forEach((lote) => {
          lotesMap[lote.id] = lote;
        });

        setLotes(lotesMap);
      } catch (error) {
        console.error("Error fetching lotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLotes();
  }, [loteIds.join(",")]);

  const getLoteById = (id: string): Lote | undefined => {
    return lotes[id];
  };

  return {
    lotes,
    loading,
    getLoteById,
  };
};
