import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, User, Navigation, Ruler } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import 'leaflet/dist/leaflet.css';

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

// Custom icons
const userIcon = new L.DivIcon({
  html: `<div style="
    width: 40px; height: 40px;
    background: #2563eb;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(37,99,235,0.5);
    display: flex; align-items: center; justify-content: center;
  ">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -24],
});

const createLoteIcon = (index: number) => new L.DivIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: #16a34a;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 4px 14px rgba(22,163,74,0.45);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 13px; color: white;
    font-family: system-ui, sans-serif;
  ">${index + 1}</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

// Auto-fit bounds + invalidate size for dialog rendering
function MapController({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  React.useEffect(() => {
    // Leaflet needs this when rendered inside hidden containers (Dialog)
    setTimeout(() => {
      map.invalidateSize();
      if (bounds) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }, 200);
  }, [map, bounds]);
  return null;
}

const formatDistance = (distance: number) => {
  if (distance < 1) return `${Math.round(distance * 1000)}m`;
  return `${distance.toFixed(1)} km`;
};

export const SearchResultsMap: React.FC<SearchResultsMapProps> = ({
  userLocation,
  results,
  onLoteSelect,
}) => {
  // Compute map bounds
  const bounds = useMemo(() => {
    const points: [number, number][] = [];
    if (userLocation) points.push([userLocation.lat, userLocation.lng]);
    results.forEach(r => {
      const lat = Number(r.lote.ubicacion_lat);
      const lng = Number(r.lote.ubicacion_lng);
      if (!isNaN(lat) && !isNaN(lng)) points.push([lat, lng]);
    });
    if (points.length === 0) return null;
    return L.latLngBounds(points.map(p => L.latLng(p[0], p[1])));
  }, [userLocation, results]);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : results.length > 0
      ? [Number(results[0].lote.ubicacion_lat), Number(results[0].lote.ubicacion_lng)]
      : [4.65, -74.1]; // Bogotá default

  const closestDistance = results.length > 0 ? Math.min(...results.map(r => r.distance)) : 0;
  const farthestDistance = results.length > 0 ? Math.max(...results.map(r => r.distance)) : 0;

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 420 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController bounds={bounds} />

          {/* User location marker + radius circle */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-sm">Tu ubicación</p>
                    <p className="text-xs text-gray-500">
                      {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={closestDistance > 0 ? Math.min(closestDistance * 1000, 50000) : 5000}
                pathOptions={{
                  color: '#2563eb',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.06,
                  weight: 1,
                  dashArray: '6 4',
                }}
              />
            </>
          )}

          {/* Lote markers */}
          {results.map((result, index) => {
            const lat = Number(result.lote.ubicacion_lat);
            const lng = Number(result.lote.ubicacion_lng);
            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={result.lote.id}
                position={[lat, lng]}
                icon={createLoteIcon(index)}
                eventHandlers={{
                  click: () => onLoteSelect(result.lote, result.distance),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    {result.lote.imagenes?.[0] && (
                      <img
                        src={result.lote.imagenes[0]}
                        alt={result.lote.titulo || 'Lote'}
                        className="w-full h-24 object-cover rounded-md mb-2"
                      />
                    )}
                    <p className="font-semibold text-sm mb-0.5">
                      {result.lote.titulo || result.lote.tipos_residuo?.nombre || 'Lote R.O.A'}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {result.lote.tipos_residuo?.nombre}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-green-700">
                        {result.lote.peso_estimado} kg
                      </span>
                      {userLocation && (
                        <span className="font-medium text-blue-600">
                          {formatDistance(result.distance)}
                        </span>
                      )}
                    </div>
                    {result.lote.direccion && (
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        📍 {result.lote.direccion}
                      </p>
                    )}
                    <button
                      onClick={() => onLoteSelect(result.lote, result.distance)}
                      className="mt-2 w-full text-xs bg-green-600 text-white py-1.5 rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      Ver detalles
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend + Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
          <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm text-gray-700">Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg border p-3">
          <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center shadow-sm text-white text-xs font-bold">
            #
          </div>
          <span className="text-sm text-gray-700">Lotes R.O.A</span>
        </div>
        {userLocation && results.length > 0 && (
          <>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-green-600">{formatDistance(closestDistance)}</div>
              <div className="text-xs text-gray-500">Más cercano</div>
            </div>
            <div className="bg-white rounded-lg border p-3 text-center">
              <div className="text-lg font-bold text-orange-500">{formatDistance(farthestDistance)}</div>
              <div className="text-xs text-gray-500">Más lejano</div>
            </div>
          </>
        )}
      </div>

      {/* Numbered list of lotes */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl border divide-y">
          <div className="px-4 py-2.5 bg-gray-50 rounded-t-xl">
            <span className="text-sm font-semibold text-gray-700">
              {results.length} lote{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </span>
          </div>
          {results.slice(0, 10).map((result, index) => (
            <div
              key={result.lote.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors"
              onClick={() => onLoteSelect(result.lote, result.distance)}
            >
              <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              {result.lote.imagenes?.[0] && (
                <img
                  src={result.lote.imagenes[0]}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {result.lote.titulo || result.lote.tipos_residuo?.nombre || 'Lote R.O.A'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {result.lote.peso_estimado} kg · {result.lote.direccion || 'Sin dirección'}
                </p>
              </div>
              {userLocation && (
                <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
                  {formatDistance(result.distance)}
                </span>
              )}
            </div>
          ))}
          {results.length > 10 && (
            <div className="px-4 py-2 text-center text-xs text-gray-400">
              Y {results.length - 10} lotes más en la lista principal
            </div>
          )}
        </div>
      )}
    </div>
  );
};
