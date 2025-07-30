
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface SearchFilters {
  lat: number;
  lng: number;
  radiusKm: number;
  tipoResiduoId?: string; // Changed to use UUID instead of enum
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
}

export const useSearchLotes = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchLotes = async (filters: SearchFilters) => {
    setLoading(true);
    try {
      console.log('Starting search with filters:', filters);

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
        .eq('status', 'aprobado') // Only show approved lots
        .order('created_at', { ascending: false });

      // Add type filter if specified
      if (filters.tipoResiduoId) {
        query = query.eq('tipo_residuo_id', filters.tipoResiduoId);
      }

      const { data, error } = await query;

      console.log('Query result:', { data, error });

      if (error) throw error;

      if (!data) {
        console.log('No data returned from query');
        setResults([]);
        return;
      }

      console.log('Found lotes before distance filter:', data.length);

      // Calculate distances and filter by radius
      const resultsWithDistance: SearchResult[] = data
        .map(lote => {
          const distance = calculateDistance(
            filters.lat,
            filters.lng,
            lote.ubicacion_lat,
            lote.ubicacion_lng
          );

          return {
            lote,
            distance
          };
        })
        .filter(result => result.distance <= filters.radiusKm)
        .sort((a, b) => a.distance - b.distance); // Sort by distance (closest first)

      console.log('Found lotes after distance filter:', resultsWithDistance.length);

      setResults(resultsWithDistance);

      toast({
        title: "Búsqueda completada",
        description: `Se encontraron ${resultsWithDistance.length} lotes en un radio de ${filters.radiusKm}km`,
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
