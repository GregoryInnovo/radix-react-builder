
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type ROAType = Database['public']['Enums']['roa_type'];

interface SearchFilters {
  lat: number;
  lng: number;
  radiusKm: number;
  tipoResiduo?: ROAType;
}

interface SearchResult {
  lote: Lote;
  distance: number;
}

export const useSearchLotes = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const searchLotes = async (filters: SearchFilters) => {
    setLoading(true);
    try {
      // Build the query
      let query = supabase
        .from('lotes')
        .select('*')
        .in('estado', ['disponible']) // Only show available lots
        .order('created_at', { ascending: false });

      // Add type filter if specified
      if (filters.tipoResiduo) {
        query = query.eq('tipo_residuo', filters.tipoResiduo);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data) {
        setResults([]);
        return;
      }

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
