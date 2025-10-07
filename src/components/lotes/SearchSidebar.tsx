import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Navigation, Map as MapIcon } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';

interface SearchSidebarProps {
  allLotes: any[];
  onSearchResults: (
    results: any[], 
    location: { lat: number; lng: number } | null,
    radius: number | null,
    searchTerm: string
  ) => void;
  onShowMap: () => void;
}

export const SearchSidebar: React.FC<SearchSidebarProps> = ({
  allLotes,
  onSearchResults,
  onShowMap
}) => {
  const [textSearch, setTextSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState('50');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  const { getProfileById } = useProfiles();

  // Fetch profiles for search
  useEffect(() => {
    const fetchProfiles = async () => {
      const uniqueUserIds = [...new Set(allLotes.map(lote => lote.user_id))];
      
      for (const userId of uniqueUserIds) {
        if (!profiles[userId]) {
          const profile = await getProfileById(userId);
          if (profile) {
            setProfiles(prev => ({
              ...prev,
              [userId]: profile
            }));
          }
        }
      }
    };
    
    if (allLotes.length > 0) {
      fetchProfiles();
    }
  }, [allLotes, getProfileById]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('La geolocalización no está soportada en este navegador');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setManualLocation({ lat: location.lat.toString(), lng: location.lng.toString() });
        setIsDetectingLocation(false);
      },
      (error) => {
        setLocationError('No se pudo obtener la ubicación');
        setIsDetectingLocation(false);
      }
    );
  };

  const handleManualLocationChange = (field: 'lat' | 'lng', value: string) => {
    setManualLocation(prev => ({ ...prev, [field]: value }));
    
    const lat = field === 'lat' ? parseFloat(value) : parseFloat(manualLocation.lat);
    const lng = field === 'lng' ? parseFloat(value) : parseFloat(manualLocation.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserLocation({ lat, lng });
      setLocationError(null);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleSearch = () => {
    let filteredLotes = [...allLotes];

    // Filter by text (titulo, provider name, tipo_residuo)
    if (textSearch.trim()) {
      const searchTerm = textSearch.toLowerCase();
      filteredLotes = filteredLotes.filter(lote => {
        const profile = profiles[lote.user_id];
        const providerName = profile?.full_name?.toLowerCase() || '';
        
        return (
          lote.titulo?.toLowerCase().includes(searchTerm) ||
          providerName.includes(searchTerm) ||
          lote.tipos_residuo?.nombre?.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Filter by location and calculate distances
    let lotesWithDistance = filteredLotes;
    if (userLocation) {
      const radiusKm = parseInt(radius);
      lotesWithDistance = filteredLotes
        .map(lote => {
          if (!lote.ubicacion_lat || !lote.ubicacion_lng) return null;
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            parseFloat(lote.ubicacion_lat),
            parseFloat(lote.ubicacion_lng)
          );
          return { lote, distance };
        })
        .filter((item): item is { lote: any; distance: number } => 
          item !== null && item.distance <= radiusKm
        )
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.lote);
    }

    onSearchResults(
      lotesWithDistance, 
      userLocation, 
      userLocation ? parseInt(radius) : null,
      textSearch.trim()
    );
  };

  const handleReset = () => {
    setTextSearch('');
    setUserLocation(null);
    setManualLocation({ lat: '', lng: '' });
    setRadius('50');
    setLocationError(null);
    onSearchResults(allLotes, null, null, '');
  };

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Search className="w-4 h-4" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Buscar por palabra clave</label>
          <p className="text-xs text-muted-foreground">
            Busca por título, nombre del proveedor o tipo de residuo
          </p>
          <Input
            type="text"
            placeholder="Ej: Cristian, Cáscaras..."
            value={textSearch}
            onChange={(e) => setTextSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Location Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Ubicación (opcional)</label>
          
          <Button
            variant="outline"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="w-full"
            size="sm"
          >
            <Navigation className="w-4 h-4 mr-2" />
            {isDetectingLocation ? 'Detectando...' : 'Usar GPS'}
          </Button>

          <div className="grid grid-cols-1 gap-2">
            <Input
              type="number"
              placeholder="Latitud"
              value={manualLocation.lat}
              onChange={(e) => handleManualLocationChange('lat', e.target.value)}
              step="any"
            />
            <Input
              type="number"
              placeholder="Longitud"
              value={manualLocation.lng}
              onChange={(e) => handleManualLocationChange('lng', e.target.value)}
              step="any"
            />
          </div>

          {locationError && (
            <p className="text-xs text-red-600">{locationError}</p>
          )}
        </div>

        {/* Radius Filter */}
        {userLocation && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Radio (km)</label>
            <Select value={radius} onValueChange={setRadius}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 km</SelectItem>
                <SelectItem value="3">3 km</SelectItem>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
                <SelectItem value="100">100 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Button onClick={handleSearch} className="w-full" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Filtrar
          </Button>
          
          {/* Show Map Button */}
          <Button 
            onClick={onShowMap} 
            variant="secondary" 
            className="w-full" 
            size="sm"
            disabled={!userLocation}
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Mostrar Mapa
          </Button>
          
          <Button onClick={handleReset} variant="outline" className="w-full" size="sm">
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};