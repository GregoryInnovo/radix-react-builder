import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { MapPin, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import 'mapbox-gl/dist/mapbox-gl.css';
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

interface MapboxMapProps {
  userLocation?: { lat: number; lng: number } | null;
  results: SearchResult[];
  onLoteSelect: (lote: Lote, distance: number) => void;
}

export const MapboxMap: React.FC<MapboxMapProps> = ({
  userLocation,
  results,
  onLoteSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenError, setTokenError] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const loteMarkers = useRef<mapboxgl.Marker[]>([]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken.trim()) return;

    try {
      mapboxgl.accessToken = mapboxToken.trim();
      
      // Calculate initial center and zoom
      let center: [number, number] = [-74.0721, 4.7110]; // Default to Bogotá
      let zoom = 10;

      if (userLocation) {
        center = [userLocation.lng, userLocation.lat];
        zoom = 12;
      } else if (results.length > 0) {
        // Center on first result
        const firstResult = results[0];
        center = [Number(firstResult.lote.ubicacion_lng), Number(firstResult.lote.ubicacion_lat)];
        zoom = 11;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12', // Street style with buildings and details
        center,
        zoom,
        projection: 'mercator'
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add geolocate control
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapReady(true);
        updateMarkers();
      });

      setTokenError(false);
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
  };

  const updateMarkers = () => {
    if (!map.current || !mapReady) return;

    // Clear existing markers
    loteMarkers.current.forEach(marker => marker.remove());
    loteMarkers.current = [];
    if (userMarker.current) {
      userMarker.current.remove();
      userMarker.current = null;
    }

    // Add user location marker
    if (userLocation) {
      const userEl = document.createElement('div');
      userEl.className = 'user-marker';
      userEl.style.cssText = `
        background: #3b82f6;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      userEl.innerHTML = '<div style="color: white; font-size: 14px;">📍</div>';

      userMarker.current = new mapboxgl.Marker({ element: userEl })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML('<strong>Tu ubicación</strong>')
        )
        .addTo(map.current);
    }

    // Add lote markers
    results.forEach((result, index) => {
      const loteEl = document.createElement('div');
      loteEl.className = 'lote-marker';
      loteEl.style.cssText = `
        background: #10b981;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      `;
      loteEl.innerHTML = '<div style="color: white; font-size: 12px;">🌱</div>';

      loteEl.addEventListener('mouseenter', () => {
        loteEl.style.transform = 'scale(1.1)';
      });
      loteEl.addEventListener('mouseleave', () => {
        loteEl.style.transform = 'scale(1)';
      });

      const formatDistance = (distance: number) => {
        if (distance < 1) {
          return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
      };

      const popupContent = `
        <div style="font-family: sans-serif;">
          <strong>${result.lote.tipos_residuo?.nombre || 'Lote ROA'}</strong><br>
          <small>Peso: ${result.lote.peso_estimado} kg</small><br>
          ${userLocation ? `<small>Distancia: ${formatDistance(result.distance)}</small><br>` : ''}
          <button onclick="window.selectLote && window.selectLote('${result.lote.id}')" 
                  style="background: #10b981; color: white; border: none; padding: 4px 8px; border-radius: 4px; margin-top: 8px; cursor: pointer;">
            Ver detalles
          </button>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: loteEl })
        .setLngLat([Number(result.lote.ubicacion_lng), Number(result.lote.ubicacion_lat)])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(popupContent)
        )
        .addTo(map.current!);

      loteMarkers.current.push(marker);
    });

    // Set up global callback for popup buttons
    (window as any).selectLote = (loteId: string) => {
      const result = results.find(r => r.lote.id === loteId);
      if (result) {
        onLoteSelect(result.lote, result.distance);
      }
    };

    // Fit map to show all markers
    if (results.length > 0 || userLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
      }
      
      results.forEach(result => {
        bounds.extend([Number(result.lote.ubicacion_lng), Number(result.lote.ubicacion_lat)]);
      });

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  };

  useEffect(() => {
    initializeMap();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  useEffect(() => {
    updateMarkers();
  }, [userLocation, results, mapReady]);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (!mapboxToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Configuración del Mapa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Para mostrar el mapa interactivo, necesitas agregar tu token público de Mapbox.
              Puedes obtenerlo gratis en{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                mapbox.com
              </a>
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Token público de Mapbox:</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={initializeMap}
                disabled={!mapboxToken.trim()}
              >
                Cargar Mapa
              </Button>
            </div>
          </div>
          
          {tokenError && (
            <Alert variant="destructive">
              <AlertDescription>
                Error al cargar el mapa. Verifica que el token sea válido.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="w-full h-96 rounded-lg border border-gray-200 overflow-hidden"
          style={{ minHeight: '400px' }}
        />
        
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-white text-xs">📍</span>
          </div>
          <span>Tu ubicación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
            <span className="text-white text-xs">🌱</span>
          </div>
          <span>Lotes de ROA disponibles</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="text-xs">Haz clic en un marcador para ver detalles</span>
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