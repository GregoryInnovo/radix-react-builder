
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface SearchFilters {
  lat: number;
  lng: number;
  radiusKm: number;
  tipoResiduoId?: string;
  textSearch?: string;
}

interface SearchResult {
  lote: Lote & {
    tipos_residuo?: {
      id: string;
      nombre: string;
      descripcion: string | null;
    } | null;
  };
  distance: number;
  relevanceScore: number;
}

export const useSearchLotes = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { user } = useAuth();

  // Function to normalize text for search comparison
  const normalizeText = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .trim();
  };

  // Function to calculate text relevance score
  const calculateRelevanceScore = (lote: any, searchTerms: string[], profiles?: Record<string, any>) => {
    let score = 0;
    
    // Check titulo (highest priority)
    if (lote.titulo) {
      const tituloNormalizado = normalizeText(lote.titulo);
      searchTerms.forEach(term => {
        if (tituloNormalizado.includes(term)) {
          score += 5; // Highest weight for title matches
        }
      });
    }

    // Check provider name (high priority)
    if (profiles && lote.user_id && profiles[lote.user_id]?.full_name) {
      const providerName = normalizeText(profiles[lote.user_id].full_name);
      searchTerms.forEach(term => {
        if (providerName.includes(term)) {
          score += 4; // High weight for provider name matches
        }
      });
    }
    
    // Check tipo_residuo name
    if (lote.tipos_residuo?.nombre) {
      const tipoNormalizado = normalizeText(lote.tipos_residuo.nombre);
      searchTerms.forEach(term => {
        if (tipoNormalizado.includes(term)) {
          score += 3; // Medium-high weight for type matches
        }
      });
    }

    return score;
  };

  const searchLotes = async (filters: SearchFilters, profiles?: Record<string, any>) => {
    setLoading(true);
    try {
      console.log('Starting search with filters:', filters);
      console.log('Current user:', user?.id);

      // Build the query - include tipos_residuo join
      let query = supabase
        .from('lotes')
        .select(`
          *,
          tipos_residuo:tipo_residuo_id (
            id,
            nombre,
            descripcion
          )
        `)
        .eq('estado', 'disponible') // Only show available lots
        .eq('status', 'aprobado') // Only show admin-approved lots
        .order('created_at', { ascending: false });

      // Add type filter if specified
      if (filters.tipoResiduoId) {
        query = query.eq('tipo_residuo_id', filters.tipoResiduoId);
      }

      const { data, error } = await query;

      console.log('Raw query result:', { data, error, count: data?.length });

      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }

      if (!data) {
        console.log('No data returned from query');
        setResults([]);
        return;
      }

      console.log('Found lotes before filtering:', data.map(lote => ({
        id: lote.id,
        status: lote.status,
        estado: lote.estado,
        user_id: lote.user_id,
        peso: lote.peso_estimado,
        lat: lote.ubicacion_lat,
        lng: lote.ubicacion_lng,
        tipo_residuo_id: lote.tipo_residuo_id,
        created_at: lote.created_at
      })));

      // Filter lotes: show approved lotes OR own lotes (including pending ones)
      const filteredData = data.filter(lote => {
        const isApproved = lote.status === 'aprobado';
        const isOwnLote = user && lote.user_id === user.id;
        const shouldInclude = isApproved || isOwnLote;
        
        console.log(`Lote ${lote.id}: status=${lote.status}, isOwn=${isOwnLote}, include=${shouldInclude}`);
        return shouldInclude;
      });

      console.log('Found lotes after status filter:', filteredData.length);

      // Process text search if provided
      let searchFilteredData = filteredData;
      if (filters.textSearch && filters.textSearch.trim()) {
        const searchTerms = normalizeText(filters.textSearch)
          .split(/\s+/)
          .filter(term => term.length > 0);
        
        console.log('Search terms:', searchTerms);
        
        searchFilteredData = filteredData.filter(lote => {
          const score = calculateRelevanceScore(lote, searchTerms, profiles);
          console.log(`Lote ${lote.id}: relevance score = ${score}`);
          return score > 0;
        });
        
        console.log('Found lotes after text search:', searchFilteredData.length);
      }

      // Calculate distances and relevance scores
      const resultsWithDistance: SearchResult[] = searchFilteredData
        .map(lote => {
          const distance = calculateDistance(
            filters.lat,
            filters.lng,
            lote.ubicacion_lat,
            lote.ubicacion_lng
          );

          const relevanceScore = filters.textSearch && filters.textSearch.trim() 
            ? calculateRelevanceScore(lote, normalizeText(filters.textSearch).split(/\s+/).filter(term => term.length > 0), profiles)
            : 1; // Default relevance for non-text searches

          console.log(`Distance for lote ${lote.id}: ${distance}km (max: ${filters.radiusKm}km), relevance: ${relevanceScore}`);

          return {
            lote,
            distance,
            relevanceScore
          };
        })
        .filter(result => {
          // For text-only searches with large radius, don't filter by distance
          if (filters.radiusKm >= 1000) {
            return true;
          }
          const withinRadius = result.distance <= filters.radiusKm;
          console.log(`Lote ${result.lote.id}: distance=${result.distance}km, withinRadius=${withinRadius}`);
          return withinRadius;
        })
        .sort((a, b) => {
          // Sort by relevance first (if text search), then by distance
          if (filters.textSearch && filters.textSearch.trim()) {
            if (b.relevanceScore !== a.relevanceScore) {
              return b.relevanceScore - a.relevanceScore;
            }
          }
          return a.distance - b.distance;
        });

      console.log('Final results after all filters:', resultsWithDistance.length);
      console.log('Final results:', resultsWithDistance.map(r => ({
        id: r.lote.id,
        distance: r.distance,
        relevanceScore: r.relevanceScore,
        status: r.lote.status,
        isOwn: r.lote.user_id === user?.id
      })));

      setResults(resultsWithDistance);

      const isTextOnlySearch = filters.radiusKm >= 1000;
      const message = resultsWithDistance.length > 0 
        ? `Se encontraron ${resultsWithDistance.length} lotes${filters.textSearch ? ' que coinciden con tu búsqueda' : ''}${!isTextOnlySearch ? ` en un radio de ${filters.radiusKm}km` : ''}`
        : filters.textSearch && filters.textSearch.trim()
          ? "No se encontraron lotes con esas palabras. Prueba con otra descripción o combina con filtros de ubicación."
          : `No se encontraron lotes en el radio seleccionado. Se consultaron ${data.length} lotes en total.`;

      toast({
        title: "Búsqueda completada",
        description: message,
      });

    } catch (error: any) {
      console.error('Error searching lotes:', error);
      toast({
        title: "Error en la búsqueda",
        description: error.message,
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    searchLotes,
    loading,
    results,
  };
};

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}
