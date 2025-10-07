import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { MapPin, Weight, Calendar, Eye, Package, AlertTriangle, Map as MapIcon, Navigation2 } from 'lucide-react';
import { usePublicLotes } from '@/hooks/usePublicLotes';
import { useProfiles } from '@/hooks/useProfiles';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { ReservarLote } from '@/components/lotes/ReservarLote';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { SearchSidebar } from './SearchSidebar';
import { SearchResultsMap } from '@/components/search/SearchResultsMap';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TiposROASection } from '@/components/search/TiposROASection';

export const LotesPublicos: React.FC = () => {
  const { lotes, loading } = usePublicLotes();
  const { getProfileById } = useProfiles();
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<any>(null);
  const [selectedLoteDistance, setSelectedLoteDistance] = useState<number>(0);
  const [filteredLotes, setFilteredLotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeRadius, setActiveRadius] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  React.useEffect(() => {
    applyFilters();
  }, [lotes, selectedType, searchResults]);

  const applyFilters = () => {
    let filtered = searchResults.length > 0 ? searchResults : lotes;
    
    if (selectedType) {
      filtered = filtered.filter(lote => lote.tipo_residuo_id === selectedType);
    }
    
    setFilteredLotes(filtered);
  };

  // Fetch profiles for lote owners
  React.useEffect(() => {
    const fetchProfiles = async () => {
      const uniqueUserIds = [...new Set(lotes.map(lote => lote.user_id))];
      
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
    
    if (lotes.length > 0) {
      fetchProfiles();
    }
  }, [lotes, getProfileById, profiles]);

  const handleSearchResults = (
    results: any[], 
    location: { lat: number; lng: number } | null,
    radius: number | null,
    search: string
  ) => {
    setSearchResults(results);
    setUserLocation(location);
    setActiveRadius(radius);
    setSearchTerm(search);
  };

  const handleLoteSelectFromMap = (lote: any, distance: number) => {
    setSelectedLote(lote);
    setSelectedLoteDistance(distance);
    setShowMapModal(false);
  };

  const handleTypeSelect = (typeId: string) => {
    if (typeId === 'all') {
      setSelectedType('');
    } else {
      setSelectedType(typeId === selectedType ? '' : typeId);
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

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const isExpired = (fecha_vencimiento: string | null) => {
    if (!fecha_vencimiento) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(fecha_vencimiento);
    expDate.setHours(0, 0, 0, 0);
    return expDate < today;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search Sidebar */}
        <div className="lg:col-span-1">
          <SearchSidebar 
            allLotes={lotes}
            onSearchResults={handleSearchResults}
            onShowMap={() => setShowMapModal(true)}
          />
        </div>

        {/* Lotes Grid */}
        <div className="lg:col-span-3">
          {/* ROA Types Filter */}
          <div className="mb-6">
            <TiposROASection 
              selectedType={selectedType}
              onTypeSelect={handleTypeSelect}
            />
          </div>

          {/* Search Feedback */}
          {searchTerm && filteredLotes.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                Mostrando <strong>{filteredLotes.length}</strong> lote{filteredLotes.length !== 1 ? 's' : ''} que coincide{filteredLotes.length !== 1 ? 'n' : ''} con <strong>"{searchTerm}"</strong>
              </p>
            </div>
          )}

          {/* Radius Separator */}
          {activeRadius && userLocation && filteredLotes.length > 0 && (
            <div className="mb-6">
              <Separator className="my-4" />
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Navigation2 className="w-4 h-4" />
                <p className="text-sm font-medium">
                  Lotes de R.O.A a menos de <span className="text-primary font-bold">{activeRadius} km</span>
                </p>
              </div>
              <Separator className="my-4" />
            </div>
          )}

          {filteredLotes.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron lotes públicos
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  No hay lotes disponibles que coincidan con los filtros seleccionados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLotes.map((lote) => {
                const profile = profiles[lote.user_id];
                const isOwnLote = user?.id === lote.user_id;

                const loteDistance = userLocation && lote.ubicacion_lat && lote.ubicacion_lng
                  ? calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      parseFloat(lote.ubicacion_lat),
                      parseFloat(lote.ubicacion_lng)
                    )
                  : null;

                return (
                  <Card key={lote.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-lg">
                            {lote.titulo || `${lote.peso_estimado}kg de R.O.A`}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {lote.direccion || 'Dirección no especificada'}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {lote.tipos_residuo?.nombre || 'Sin categoría'}
                          </Badge>
                          {loteDistance !== null && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Navigation2 className="w-3 h-3 mr-1" />
                              {formatDistance(loteDistance)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Images */}
                      {lote.imagenes && lote.imagenes.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                          {lote.imagenes.slice(0, 2).map((imagen: string, index: number) => (
                            <img
                              key={index}
                              src={imagen}
                              alt={`Lote ${index + 1}`}
                              className="w-full h-20 object-cover rounded-md"
                            />
                          ))}
                        </div>
                      )}

                      {/* Lote Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Weight className="w-4 h-4" />
                          {lote.peso_estimado}kg
                        </div>
                        {lote.fecha_vencimiento && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              Vence: {format(new Date(lote.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            {isExpired(lote.fecha_vencimiento) && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Vencido
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {lote.descripcion && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lote.descripcion}
                        </p>
                      )}

                      {/* Provider Info */}
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Proveedor</p>
                        {profile ? (
                          <UserProfileLink 
                            userId={lote.user_id}
                            userName={profile.full_name}
                            userEmail={profile.email}
                            size="sm"
                          />
                        ) : (
                          <span className="text-sm">Cargando...</span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLote(lote)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalles
                        </Button>
                        
                        {!isOwnLote && (
                          <div className="flex-1">
                            <ReservarLote lote={lote} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Lote Details Modal */}
      {selectedLote && (
        <LoteDetailsModal
          isOpen={!!selectedLote}
          onClose={() => {
            setSelectedLote(null);
            setSelectedLoteDistance(0);
          }}
          lote={selectedLote}
          distance={selectedLoteDistance}
        />
      )}

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapIcon className="w-5 h-5" />
              Mapa de Lotes Disponibles
            </DialogTitle>
          </DialogHeader>
          {userLocation && (
            <SearchResultsMap
              userLocation={userLocation}
              results={filteredLotes.map(lote => {
                const distance = calculateDistance(
                  userLocation.lat,
                  userLocation.lng,
                  parseFloat(lote.ubicacion_lat),
                  parseFloat(lote.ubicacion_lng)
                );
                return {
                  lote,
                  distance,
                  relevanceScore: 1
                };
              })}
              onLoteSelect={handleLoteSelectFromMap}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};