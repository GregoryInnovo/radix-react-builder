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
import { useTiposResiduo } from '@/hooks/useTiposResiduo';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { ReservarLote } from '@/components/lotes/ReservarLote';
import { LocationMap } from '@/components/search/LocationMap';
import { SearchResultsMap } from '@/components/search/SearchResultsMap';
import { MapboxMap } from '@/components/search/MapboxMap';
import { useAuth } from '@/hooks/useAuth';

const Search = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState({ lat: '', lng: '' });
  const [radius, setRadius] = useState('5');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [textSearch, setTextSearch] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedLote, setSelectedLote] = useState<any>(null);
  const [selectedDistance, setSelectedDistance] = useState<number>(0);
  const [searchMode, setSearchMode] = useState<'text' | 'location' | 'both'>('text');

  const { searchLotes, loading, results } = useSearchLotes();
  const { tiposResiduos } = useTiposResiduo();
  const { user } = useAuth();

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
    // Text-only search
    if (searchMode === 'text' && textSearch.trim()) {
      // For text-only search, use a default center location (e.g., Bogotá)
      const defaultLocation = { lat: 4.7110, lng: -74.0721 };
      
      const filters = {
        lat: defaultLocation.lat,
        lng: defaultLocation.lng,
        radiusKm: 1000, // Large radius for text-only search
        tipoResiduoId: selectedType === 'all' ? undefined : selectedType,
        textSearch: textSearch.trim()
      };

      console.log('Text-only search filters:', filters);
      searchLotes(filters);
      return;
    }

    // Location-based or combined search
    if (!userLocation && (searchMode === 'location' || searchMode === 'both')) {
      setLocationError('Debes proporcionar una ubicación para buscar por proximidad');
      return;
    }

    if (userLocation) {
      const filters = {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radiusKm: parseInt(radius),
        tipoResiduoId: selectedType === 'all' ? undefined : selectedType,
        textSearch: textSearch.trim() || undefined
      };

      console.log('Location-based search filters:', filters);
      searchLotes(filters);
    }
  };

  const handleTextSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (textSearch.trim()) {
        setSearchMode('text');
        handleSearch();
      }
    }
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
                Encuentra residuos orgánicos aprovechables por palabras clave o cerca de tu ubicación
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
                  Busca por palabras clave o configura tu ubicación para búsqueda por proximidad
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Text Search Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar por palabras clave</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Ej: cáscara naranja, posos café, compost, etc."
                      value={textSearch}
                      onChange={(e) => setTextSearch(e.target.value)}
                      onKeyPress={handleTextSearchKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (textSearch.trim()) {
                          setSearchMode('text');
                          handleSearch();
                        }
                      }}
                      disabled={!textSearch.trim() || loading}
                      variant="outline"
                    >
                      <SearchIcon className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Presiona Enter o haz clic en el botón para buscar solo por texto
                  </p>
                </div>

                {/* Location Input */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Búsqueda por ubicación (opcional)</label>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-3">
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
                    </div>
                    
                    {/* Location Map */}
                    {userLocation && (
                      <div className="flex justify-center lg:justify-end">
                        <LocationMap 
                          lat={userLocation.lat} 
                          lng={userLocation.lng}
                          className="w-full max-w-32"
                        />
                      </div>
                    )}
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
                        {tiposResiduos.map((tipo) => (
                          <SelectItem key={tipo.id} value={tipo.id}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setSearchMode(userLocation && textSearch.trim() ? 'both' : userLocation ? 'location' : 'text');
                    handleSearch();
                  }}
                  disabled={loading || (!textSearch.trim() && !userLocation)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                >
                  <SearchIcon className="w-4 h-4 mr-2" />
                  {loading ? 'Buscando...' : 'Buscar Lotes'}
                </Button>
              </CardContent>
            </Card>

            {/* Interactive Map */}
            {(userLocation || results.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Mapa de Resultados
                  </CardTitle>
                  <CardDescription>
                    Visualización de tu ubicación y los lotes encontrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MapboxMap
                    userLocation={userLocation}
                    results={results}
                    onLoteSelect={(lote, distance) => {
                      setSelectedLote(lote);
                      setSelectedDistance(distance);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Resultados de búsqueda ({results.length} lotes encontrados)
                  {textSearch && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      para "{textSearch}"
                    </span>
                  )}
                </h2>

                <div className="grid gap-4">
                  {results.map((result) => (
                    <Card key={result.lote.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-green-800">
                              Lote de ROA
                              {result.lote.user_id === user?.id && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Tu lote
                                </Badge>
                              )}
                              {textSearch && result.relevanceScore > 1 && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  Muy relevante
                                </Badge>
                              )}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Weight className="w-4 h-4" />
                              {result.lote.peso_estimado} kg
                            </div>
                            {result.lote.tipos_residuo && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                <span className="font-medium">Tipo:</span>
                                <span>{result.lote.tipos_residuo.nombre}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-right">
                            {userLocation && (
                              <Badge variant="outline" className="mb-2">
                                <MapPin className="w-3 h-3 mr-1" />
                                {formatDistance(result.distance)}
                              </Badge>
                            )}
                            <div className="flex flex-col gap-1">
                              <Badge className="bg-green-100 text-green-800">
                                {result.lote.estado}
                              </Badge>
                              <Badge variant={result.lote.status === 'aprobado' ? 'default' : 'secondary'} className="text-xs">
                                {result.lote.status || 'pendiente'}
                              </Badge>
                            </div>
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
                            onClick={() => {
                              setSelectedLote(result.lote);
                              setSelectedDistance(result.distance);
                            }}
                          >
                            Ver Detalles
                          </Button>
                          {result.lote.user_id !== user?.id && result.lote.estado === 'disponible' ? (
                            <ReservarLote 
                              lote={result.lote}
                              onSuccess={() => {
                                // Refresh results or show success message
                                console.log('Lote reserved successfully');
                              }}
                            />
                          ) : (
                            <Button 
                              size="sm"
                              className="flex-1"
                              disabled
                              variant="outline"
                            >
                              {result.lote.user_id === user?.id ? 'Tu lote' : 
                               result.lote.estado !== 'disponible' ? 'No disponible' : 'No disponible'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.length === 0 && !loading && (textSearch.trim() || userLocation) && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <SearchIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {textSearch 
                      ? "No se encontraron lotes con esas palabras" 
                      : "No se encontraron lotes"
                    }
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    {textSearch ? (
                      <>
                        No hay lotes de ROA que coincidan con "<strong>{textSearch}</strong>".
                        <br /><br />
                        <strong>Prueba con:</strong>
                        <br />
                        • Otras palabras clave (ej: "cáscara", "orgánico", "compost")
                        <br />
                        • Seleccionar "Todos los tipos" de ROA
                        <br />
                        • Combinar con búsqueda por ubicación
                      </>
                    ) : (
                      <>
                        No hay lotes de ROA disponibles en el radio seleccionado.
                        <br />
                        <strong>Posibles causas:</strong>
                        <br />
                        • No hay lotes con estado "disponible" en el área
                        <br />
                        • Los lotes están pendientes de aprobación por un administrador
                        <br />
                        • El radio de búsqueda es muy pequeño
                        <br />
                        • El tipo de ROA seleccionado no coincide
                        <br /><br />
                        <strong>Sugerencias:</strong>
                        <br />
                        • Amplía el radio de búsqueda
                        <br />
                        • Selecciona "Todos los tipos" de ROA
                        <br />
                        • Contacta al administrador si creaste lotes recientemente
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        {/* Lote Details Modal */}
        {selectedLote && (
          <LoteDetailsModal
            isOpen={!!selectedLote}
            onClose={() => setSelectedLote(null)}
            lote={selectedLote}
            distance={selectedDistance}
          />
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Search;
