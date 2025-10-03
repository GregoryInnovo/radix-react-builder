import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package, Weight, MapPin, Calendar, Eye } from 'lucide-react';
import { LoteDetailsModal } from '@/components/lotes/LoteDetailsModal';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  } | null;
};

const UserLotes = () => {
  const { userId } = useParams<{ userId: string }>();
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  useEffect(() => {
    const fetchUserLotes = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();

        if (profile) {
          setUserName(profile.full_name || profile.email || 'Usuario');
        }

        // Fetch user lotes (only approved and available)
        const { data, error } = await supabase
          .from('lotes')
          .select(`
            *,
            tipos_residuo:tipo_residuo_id (
              id,
              nombre,
              descripcion
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'aprobado')
          .eq('estado', 'disponible')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setLotes(data || []);
      } catch (error) {
        console.error('Error fetching lotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLotes();
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Button
            variant="ghost"
            asChild
            className="flex items-center gap-2"
          >
            <Link to={`/perfil/${userId}`}>
              <ArrowLeft className="w-4 h-4" />
              Volver al perfil
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lotes R.O.A de {userName}
            </h1>
            <p className="text-gray-600">
              Lotes públicos disponibles de este usuario
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : lotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lotes.map((lote) => (
                <Card key={lote.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-green-800">
                        {lote.titulo || 'Lote de R.O.A'}
                      </CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        Disponible
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Image preview */}
                    {lote.imagenes && lote.imagenes.length > 0 && (
                      <div className="relative">
                        <img
                          src={lote.imagenes[0]}
                          alt={lote.titulo || 'Lote'}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {lote.imagenes.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                            +{lote.imagenes.length - 1} más
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Weight className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{lote.peso_estimado} kg</span>
                      </div>

                      {lote.tipos_residuo && (
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span>{lote.tipos_residuo.nombre}</span>
                        </div>
                      )}

                      {lote.direccion && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="truncate">{lote.direccion}</span>
                        </div>
                      )}

                      {lote.created_at && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(lote.created_at), 'dd/MM/yyyy', { locale: es })}
                          </span>
                        </div>
                      )}
                    </div>

                    {lote.descripcion && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {lote.descripcion}
                      </p>
                    )}

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
                      <div className="flex-1">
                        <SolicitarIntercambio
                          tipo_item="lote"
                          item_id={lote.id}
                          proveedor_id={lote.user_id}
                          disabled={false}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin lotes disponibles
                </h3>
                <p className="text-gray-600">
                  Este usuario no tiene lotes R.O.A disponibles en este momento.
                </p>
              </CardContent>
            </Card>
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

export default UserLotes;
