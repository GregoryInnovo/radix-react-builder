
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search as SearchIcon, Navigation, Weight, Calendar } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useSearchLotes } from '@/hooks/useSearchLotes';
import type { Database } from '@/integrations/supabase/types';

type ROAType = Database['public']['Enums']['roa_type'];

const ROA_TYPE_LABELS: Record<ROAType, string> = {
  'cascara_fruta': 'Cáscara de fruta',
  'posos_cafe': 'Posos de café',
  'restos_vegetales': 'Restos vegetales',
  'cascara_huevo': 'Cáscara de huevo',
  'restos_cereales': 'Restos de cereales',
  'otros': 'Otros',
};

const Search = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState('5');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { searchLotes, loading, results } = useSearchLotes();

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
        setLocationError('No se pudo obtener la ubicación. Intenta ingresar las coordenadas manualmente.');
        setIsDetectingLocation(false);
      }
    );
  };

  const handleManualLocationChange = (field: 'lat' | 'lng', value: string) => {
    setManualLocation(prev => ({ ...prev, [field]: value }));
    
    // Update user location if both fields are valid numbers
    const lat = field === 'lat' ? parseFloat(value) : parseFloat(manualLocation.lat);
    const lng = field === 'lng' ? parseFloat(value) : parseFloat(manualLocation.lng);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      setUserLocation({ lat, lng });
      setLocationError(null);
    }
  };

  const handleSearch = () => {
    if (!userLocation) {
      setLocationError('Debes proporcionar una ubicación para buscar');
      return;
    }

    const filters = {
      lat: userLocation.lat,
      lng: userLocation.lng,
      radiusKm: parseInt(radius),
      tipoResiduo: selectedType === 'all' ? undefined : selectedType as ROAType
    };

    searchLotes(filters);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Buscar Lotes de ROA
              </h1>
              <p className="text-gray-600">
                Encuentra residuos orgánicos aprovechables cerca de tu ubicación
              </p>
            </div>

            {/* Search Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="w-5 h-5" />
                  Filtros de Búsqueda
                </CardTitle>
                <CardDescription>
                  Configura tu ubicación y preferencias de búsqueda
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Ubicación</label>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className="shrink-0"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      {isDetectingLocation ? 'Detectando...' : 'Usar GPS'}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Latitud</label>
                      <Input
                        type="number"
                        placeholder="-34.603722"
                        value={manualLocation.lat}
                        onChange={(e) => handleManualLocationChange('lat', e.target.value)}
                        step="any"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Longitud</label>
                      <Input
                        type="number"
                        placeholder="-58.381592"
                        value={manualLocation.lng}
                        onChange={(e) => handleManualLocationChange('lng', e.target.value)}
                        step="any"
                      />
                    </div>
                  </div>

                  {locationError && (
                    <p className="text-sm text-red-600">{locationError}</p>
                  )}
                </div>

                {/* Radius and Type Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Radio de búsqueda (km)</label>
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tipo de ROA</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {Object.entries(ROA_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={!userLocation || loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <SearchIcon className="w-4 h-4 mr-2" />
                  {loading ? 'Buscando...' : 'Buscar Lotes'}
                </Button>
              </CardContent>
            </Card>

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Resultados de búsqueda ({results.length} lotes encontrados)
                </h2>

                <div className="grid gap-4">
                  {results.map((result) => (
                    <Card key={result.lote.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-green-800">
                              {ROA_TYPE_LABELS[result.lote.tipo_residuo]}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Weight className="w-4 h-4" />
                              {result.lote.peso_estimado} kg
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              {formatDistance(result.distance)}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800">
                              Disponible
                            </Badge>
                          </div>
                        </div>

                        {result.lote.direccion && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{result.lote.direccion}</span>
                          </div>
                        )}

                        {result.lote.fecha_disponible && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>Disponible desde: {new Date(result.lote.fecha_disponible).toLocaleDateString()}</span>
                          </div>
                        )}

                        {result.lote.descripcion && (
                          <p className="text-sm text-gray-700 mb-3">
                            {result.lote.descripcion}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-1"
                          >
                            Ver Detalles
                          </Button>
                          <Button 
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            Solicitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && !loading && userLocation && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron lotes
                  </h3>
                  <p className="text-gray-500 text-center">
                    No hay lotes de ROA disponibles en el radio seleccionado.
                    Prueba ampliando el radio de búsqueda.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Search;
