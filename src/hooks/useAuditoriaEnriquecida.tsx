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
    if (auditorias.length === 0) {
      setEnrichedAuditorias([]);
      setLoading(false);
      return;
    }

    const enrichAuditorias = async () => {
      setLoading(true);

      // 1. Collect all unique IDs to fetch in batch
      const adminIds = [...new Set(auditorias.map(a => a.user_id))];
      const loteIds = [...new Set(auditorias.filter(a => a.entity_type === 'lote').map(a => a.entity_id))];
      const productoIds = [...new Set(auditorias.filter(a => a.entity_type === 'producto').map(a => a.entity_id))];
      const usuarioIds = [...new Set(auditorias.filter(a => a.entity_type === 'usuario').map(a => a.entity_id))];

      // Combine all profile IDs we need
      const allProfileIds = [...new Set([...adminIds, ...usuarioIds])];

      // 2. Fetch all data in parallel batches (NOT one per audit record)
      const [profilesResult, lotesResult, productosResult] = await Promise.all([
        // Fetch all profiles at once
        allProfileIds.length > 0
          ? supabase.from('profiles').select('id, full_name, email, avatar_url').in('id', allProfileIds)
          : Promise.resolve({ data: [], error: null }),

        // Fetch all lotes at once
        loteIds.length > 0
          ? supabase.from('lotes').select('id, titulo, peso_estimado, imagenes, user_id, tipos_residuo:tipo_residuo_id(nombre)').in('id', loteIds)
          : Promise.resolve({ data: [], error: null }),

        // Fetch all productos at once
        productoIds.length > 0
          ? supabase.from('productos').select('id, nombre, precio_unidad, imagenes, user_id').in('id', productoIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      // 3. Build lookup maps for O(1) access
      const profileMap = new Map<string, any>();
      (profilesResult.data || []).forEach(p => profileMap.set(p.id, p));

      const loteMap = new Map<string, any>();
      (lotesResult.data || []).forEach(l => loteMap.set(l.id, l));

      const productoMap = new Map<string, any>();
      (productosResult.data || []).forEach(p => productoMap.set(p.id, p));

      // 4. Fetch lote/product owner profiles that we don't have yet
      const ownerIds = new Set<string>();
      (lotesResult.data || []).forEach(l => { if (l.user_id && !profileMap.has(l.user_id)) ownerIds.add(l.user_id); });
      (productosResult.data || []).forEach(p => { if (p.user_id && !profileMap.has(p.user_id)) ownerIds.add(p.user_id); });

      if (ownerIds.size > 0) {
        const { data: ownerProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', [...ownerIds]);

        (ownerProfiles || []).forEach(p => profileMap.set(p.id, p));
      }

      // 5. Enrich all auditorias using the maps (no more HTTP requests)
      const enriched: EnrichedAuditoria[] = auditorias.map(auditoria => {
        const enrichedItem: EnrichedAuditoria = { ...auditoria };

        // Admin data
        const admin = profileMap.get(auditoria.user_id);
        if (admin) {
          enrichedItem.admin_data = {
            full_name: admin.full_name,
            email: admin.email,
            avatar_url: admin.avatar_url,
          };
        }

        // Entity-specific data
        if (auditoria.entity_type === 'lote') {
          const lote = loteMap.get(auditoria.entity_id);
          if (lote) {
            enrichedItem.entity_data = {
              titulo: lote.titulo,
              tipo_residuo: lote.tipos_residuo?.nombre,
              peso_estimado: lote.peso_estimado,
              imagen: lote.imagenes?.[0],
            };
            const owner = profileMap.get(lote.user_id);
            if (owner) {
              enrichedItem.user_data = {
                full_name: owner.full_name,
                email: owner.email,
                avatar_url: owner.avatar_url,
              };
            }
          }
        } else if (auditoria.entity_type === 'producto') {
          const producto = productoMap.get(auditoria.entity_id);
          if (producto) {
            enrichedItem.entity_data = {
              nombre: producto.nombre,
              precio_unidad: producto.precio_unidad,
              imagen: producto.imagenes?.[0],
            };
            const owner = profileMap.get(producto.user_id);
            if (owner) {
              enrichedItem.user_data = {
                full_name: owner.full_name,
                email: owner.email,
                avatar_url: owner.avatar_url,
              };
            }
          }
        } else if (auditoria.entity_type === 'usuario') {
          const usuario = profileMap.get(auditoria.entity_id);
          if (usuario) {
            enrichedItem.entity_data = {
              full_name: usuario.full_name,
              email: usuario.email,
              avatar_url: usuario.avatar_url,
            };
          }
        }

        return enrichedItem;
      });

      setEnrichedAuditorias(enriched);
      setLoading(false);
    };

    enrichAuditorias();
  }, [auditorias]);

  return { enrichedAuditorias, loading };
};
