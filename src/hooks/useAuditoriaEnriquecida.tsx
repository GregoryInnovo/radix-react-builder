import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AuditoriaAdmin = Database['public']['Tables']['auditoria_admin']['Row'];

interface EnrichedAuditoria extends AuditoriaAdmin {
  entity_data?: {
    titulo?: string;
    nombre?: string;
    tipo_residuo?: string;
    peso_estimado?: number;
    precio_unidad?: number;
    imagen?: string;
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  admin_data?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
  user_data?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export const useAuditoriaEnriquecida = (auditorias: AuditoriaAdmin[]) => {
  const [enrichedAuditorias, setEnrichedAuditorias] = useState<EnrichedAuditoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const enrichAuditorias = async () => {
      setLoading(true);
      const enriched: EnrichedAuditoria[] = [];

      for (const auditoria of auditorias) {
        const enrichedItem: EnrichedAuditoria = { ...auditoria };

        // Obtener datos del admin
        const { data: adminData } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', auditoria.admin_id)
          .single();

        if (adminData) {
          enrichedItem.admin_data = adminData;
        }

        // Obtener datos de la entidad según su tipo
        if (auditoria.entity_type === 'lote') {
          const { data: loteData } = await supabase
            .from('lotes')
            .select(`
              titulo,
              peso_estimado,
              imagenes,
              user_id,
              tipos_residuo (nombre)
            `)
            .eq('id', auditoria.entity_id)
            .single();

          if (loteData) {
            enrichedItem.entity_data = {
              titulo: loteData.titulo,
              tipo_residuo: loteData.tipos_residuo?.nombre,
              peso_estimado: loteData.peso_estimado,
              imagen: loteData.imagenes?.[0],
            };

            // Obtener datos del usuario creador del lote
            if (loteData.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name, email, avatar_url')
                .eq('id', loteData.user_id)
                .single();

              if (userData) {
                enrichedItem.user_data = userData;
              }
            }
          }
        } else if (auditoria.entity_type === 'producto') {
          const { data: productoData } = await supabase
            .from('productos')
            .select('nombre, precio_unidad, imagenes, user_id')
            .eq('id', auditoria.entity_id)
            .single();

          if (productoData) {
            enrichedItem.entity_data = {
              nombre: productoData.nombre,
              precio_unidad: productoData.precio_unidad,
              imagen: productoData.imagenes?.[0],
            };

            // Obtener datos del usuario creador del producto
            if (productoData.user_id) {
              const { data: userData } = await supabase
                .from('profiles')
                .select('full_name, email, avatar_url')
                .eq('id', productoData.user_id)
                .single();

              if (userData) {
                enrichedItem.user_data = userData;
              }
            }
          }
        } else if (auditoria.entity_type === 'usuario') {
          const { data: userData } = await supabase
            .from('profiles')
            .select('full_name, email, avatar_url')
            .eq('id', auditoria.entity_id)
            .single();

          if (userData) {
            enrichedItem.entity_data = {
              full_name: userData.full_name,
              email: userData.email,
              avatar_url: userData.avatar_url,
            };
          }
        }

        enriched.push(enrichedItem);
      }

      setEnrichedAuditorias(enriched);
      setLoading(false);
    };

    if (auditorias.length > 0) {
      enrichAuditorias();
    } else {
      setEnrichedAuditorias([]);
      setLoading(false);
    }
  }, [auditorias]);

  return { enrichedAuditorias, loading };
};
