
import React from 'react';
import { MapPin, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
};

interface SearchResult {
  lote: Lote;
  distance: number;
  relevanceScore: number;
}

interface SearchResultsMapProps {
  userLocation?: { lat: number; lng: number } | null;
  results: SearchResult[];
  onLoteSelect: (lote: Lote, distance: number) => void;
}

export const SearchResultsMap: React.FC<SearchResultsMapProps> = ({
  userLocation,
  results,
  onLoteSelect
}) => {
  // Calculate map bounds
  const getMapBounds = () => {
    const points = [];
    if (userLocation) {
      points.push(userLocation);
    }
    results.forEach(result => {
      points.push({
        lat: result.lote.ubicacion_lat,
        lng: result.lote.ubicacion_lng
      });
    });

    if (points.length === 0) return null;

    const lats = points.map(p => Number(p.lat));
    const lngs = points.map(p => Number(p.lng));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Calculate range
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;

    // Add padding (15% on each side) for better visualization
    const latPadding = latRange * 0.15 || 0.005;
    const lngPadding = lngRange * 0.15 || 0.005;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
      centerLat: (minLat + maxLat) / 2,
      centerLng: (minLng + maxLng) / 2,
      latRange: latRange || 0.01,
      lngRange: lngRange || 0.01
    };
  };

  const bounds = getMapBounds();
  if (!bounds) return null;

  // Determine if lotes are too dispersed (> 100km max distance)
  const maxDistance = results.length > 0 ? Math.max(...results.map(r => r.distance)) : 0;
  const isVeryDispersed = maxDistance > 100;

  // Filter results for very distant cases (only show within 100km)
  const filteredResults = isVeryDispersed 
    ? results.filter(r => r.distance <= 100)
    : results;

  const hiddenCount = results.length - filteredResults.length;

  // Create a visual representation of the map area
  const mapWidth = 600;
  const mapHeight = 400;

  // Convert lat/lng to pixels for display with padding
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;

  const getPixelPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / lngRange) * (mapWidth - 40) + 20;
    const y = ((bounds.maxLat - lat) / latRange) * (mapHeight - 40) + 20;
    return { x, y };
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <div className="space-y-4">
      {/* Warning for very dispersed lotes */}
      {isVeryDispersed && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 rounded-full p-2">
              <MapPin className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Algunos lotes están muy lejos
              </p>
              <p className="text-xs text-amber-700 mt-1">
                El mapa muestra solo los lotes dentro de 100 km. Hay {hiddenCount} lote{hiddenCount !== 1 ? 's' : ''} más lejano{hiddenCount !== 1 ? 's' : ''} que se muestran en la lista principal.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Map Visualization */}
      <div className="relative bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="relative bg-gradient-to-b from-green-100 to-blue-100"
          style={{ width: mapWidth, height: mapHeight }}
        >
          {/* Grid lines to simulate streets */}
          <div className="absolute inset-0 opacity-20">
            {/* Vertical lines */}
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={`v${i}`}
                className="absolute h-full w-px bg-gray-400"
                style={{ left: `${(i / 6) * 100}%` }}
              />
            ))}
            {/* Horizontal lines */}
            {[1, 2, 3, 4].map(i => (
              <div
                key={`h${i}`}
                className="absolute w-full h-px bg-gray-400"
                style={{ top: `${(i / 5) * 100}%` }}
              />
            ))}
          </div>

          {/* User location pin */}
          {userLocation && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{
                left: getPixelPosition(userLocation.lat, userLocation.lng).x,
                top: getPixelPosition(userLocation.lat, userLocation.lng).y
              }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-blue-600 rounded-full p-3 shadow-xl border-3 border-white ring-2 ring-blue-300">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="mt-1 bg-blue-600 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap font-medium">
                  Tu ubicación
                </div>
              </div>
            </div>
          )}

          {/* Lote pins */}
          {filteredResults.map((result, index) => {
            const position = getPixelPosition(
              Number(result.lote.ubicacion_lat),
              Number(result.lote.ubicacion_lng)
            );

            return (
              <div
                key={result.lote.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:z-30 transition-all duration-200 hover:scale-110"
                style={{
                  left: position.x,
                  top: position.y
                }}
                onClick={() => onLoteSelect(result.lote, result.distance)}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-emerald-600 rounded-full p-3 shadow-xl border-3 border-white ring-2 ring-emerald-300 hover:bg-emerald-700 transition-all">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                  <div className="mt-1 bg-emerald-600 text-white text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap max-w-32 truncate hover:bg-emerald-700 font-medium">
                    {result.lote.tipos_residuo?.nombre || 'Lote R.O.A'}
                    {userLocation && (
                      <span className="block text-emerald-100">
                        {formatDistance(result.distance)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Map center coordinates display */}
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            Centro: {bounds.centerLat.toFixed(4)}°, {bounds.centerLng.toFixed(4)}°
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            {filteredResults.length} lote{filteredResults.length !== 1 ? 's' : ''} en mapa
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 rounded-full p-1">
            <User className="w-3 h-3 text-white" />
          </div>
          <span>Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-500 rounded-full p-1">
            <MapPin className="w-3 h-3 text-white fill-white" />
          </div>
          <span>Lotes de R.O.A disponibles</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs">Haz clic en un pin verde para ver detalles</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-lg font-semibold text-blue-600">{results.length}</div>
          <div className="text-xs text-gray-600">Lotes encontrados</div>
        </div>
        {userLocation && results.length > 0 && (
          <>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-semibold text-green-600">
                {formatDistance(Math.min(...results.map(r => r.distance)))}
              </div>
              <div className="text-xs text-gray-600">Más cercano</div>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-lg font-semibold text-orange-600">
                {formatDistance(Math.max(...results.map(r => r.distance)))}
              </div>
              <div className="text-xs text-gray-600">Más lejano</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
