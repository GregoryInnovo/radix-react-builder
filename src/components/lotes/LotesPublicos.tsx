import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Weight, Calendar, Eye, Package } from 'lucide-react';
import { usePublicLotes } from '@/hooks/usePublicLotes';
import { useProfiles } from '@/hooks/useProfiles';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { ReservarLote } from '@/components/lotes/ReservarLote';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { SearchSidebar } from './SearchSidebar';
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
  const [filteredLotes, setFilteredLotes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

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

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId === selectedType ? '' : typeId);
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
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

                return (
                  <Card key={lote.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {lote.peso_estimado}kg de ROA
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {lote.direccion || 'Dirección no especificada'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {lote.tipos_residuo?.nombre || 'Sin categoría'}
                        </Badge>
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
                      <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Weight className="w-4 h-4" />
                          {lote.peso_estimado}kg
                        </div>
                        {lote.fecha_disponible && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(lote.fecha_disponible), 'dd/MM/yyyy', { locale: es })}
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
          onClose={() => setSelectedLote(null)}
          lote={selectedLote}
          distance={0}
        />
      )}
    </div>
  );
};