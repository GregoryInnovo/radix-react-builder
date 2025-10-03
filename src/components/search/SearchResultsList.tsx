import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Weight, Calendar, Star } from 'lucide-react';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { ProveedorInfo } from '@/components/productos/ProveedorInfo';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';
import { useEffect, useState } from 'react';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SearchResult {
  lote: Lote;
  distance: number;
  relevanceScore: number;
}

interface SearchResultsListProps {
  results: SearchResult[];
  textSearch?: string;
  userLocation?: { lat: number; lng: number } | null;
  onLoteSelect: (lote: Lote, distance: number) => void;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({
  results,
  textSearch,
  userLocation,
  onLoteSelect
}) => {
  const { user } = useAuth();
  const { getMultipleProfiles } = useProfiles();
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    const loadProfiles = async () => {
      const userIds = [...new Set(results.map(r => r.lote.user_id))];
      if (userIds.length > 0) {
        const profilesData = await getMultipleProfiles(userIds);
        const profilesMap = profilesData.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, Profile>);
        setProfiles(profilesMap);
      }
    };

    loadProfiles();
  }, [results, getMultipleProfiles]);

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  if (results.length === 0) {
    return null;
  }

  return (
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
        {results.map((result) => {
          const profile = profiles[result.lote.user_id];
          
          return (
            <Card key={result.lote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Lote Images */}
                {result.lote.imagenes && result.lote.imagenes.length > 0 && (
                  <div className="mb-4">
                    <img
                      src={result.lote.imagenes[0]}
                      alt="Imagen del lote"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-green-800 mb-2">
                      Lote de R.O.A
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

                    {/* Provider Info */}
                    {profile && (
                      <ProveedorInfo profile={profile} size="sm" />
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Weight className="w-4 h-4" />
                        {result.lote.peso_estimado} kg
                      </div>
                      {result.lote.tipos_residuo && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">Tipo:</span>
                          <span>{result.lote.tipos_residuo.nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    {userLocation && (
                      <Badge variant="outline" className="mb-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        {formatDistance(result.distance)}
                      </Badge>
                    )}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <Badge className="bg-green-100 text-green-800">
                          {result.lote.estado}
                        </Badge>
                        {result.lote.estado === 'disponible' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </div>
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
                    onClick={() => onLoteSelect(result.lote, result.distance)}
                  >
                    Ver Detalles
                  </Button>
                  
                  {/* Solicitar Intercambio Button */}
                  {result.lote.user_id !== user?.id && result.lote.estado === 'disponible' && (
                    <div className="flex-1">
                      <SolicitarIntercambio
                        tipo_item="lote"
                        item_id={result.lote.id}
                        proveedor_id={result.lote.user_id}
                        disabled={false}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};