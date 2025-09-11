import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StarRating } from '@/components/calificaciones/StarRating';
import { UserRating } from '@/components/calificaciones/UserRating';
import { CalificacionesList } from '@/components/calificaciones/CalificacionesList';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, MapPin, Calendar, Star, MessageSquare, Package, ShoppingBag } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviews, setShowReviews] = useState(false);
  const [stats, setStats] = useState({
    totalLotes: 0,
    totalProductos: 0,
    totalOrdenes: 0
  });

  const { 
    calificaciones, 
    getCalificacionesByUser, 
    getCalificacionesRecientes,
    getUserRating, 
    getUserRatingCount,
    loading: ratingsLoading 
  } = useCalificaciones();

  const [userRating, setUserRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [recentComments, setRecentComments] = useState<any[]>([]);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) throw profileError;
      setProfile(profileData);

      if (!profileData) {
        setLoading(false);
        return;
      }

      // Fetch user stats
      const [lotesResponse, productosResponse, ordenesResponse] = await Promise.all([
        supabase
          .from('lotes')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        supabase
          .from('productos')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
        supabase
          .from('ordenes')
          .select('id', { count: 'exact' })
          .or(`solicitante_id.eq.${userId},proveedor_id.eq.${userId}`)
      ]);

      setStats({
        totalLotes: lotesResponse.count || 0,
        totalProductos: productosResponse.count || 0,
        totalOrdenes: ordenesResponse.count || 0
      });

      // Fetch ratings data
      const [avgRating, ratingCount, recentComments] = await Promise.all([
        getUserRating(userId),
        getUserRatingCount(userId),
        getCalificacionesRecientes(userId, 3)
      ]);

      setUserRating(avgRating);
      setRatingCount(ratingCount);
      setRecentComments(recentComments);

      // Fetch user reviews for "Ver más" functionality
      await getCalificacionesByUser(userId);

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuario no encontrado</h1>
            <p className="text-gray-600 mb-6">El perfil que buscas no existe o no está disponible.</p>
            <Button asChild>
              <Link to="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'generator':
        return 'Generador';
      case 'transformer':
        return 'Transformador';
      case 'citizen':
        return 'Consumidor';
      default:
        return 'Usuario';
    }
  };

  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case 'generator':
        return 'default';
      case 'transformer':
        return 'secondary';
      case 'citizen':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header del perfil */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {profile.full_name || 'Usuario sin nombre'}
                    </CardTitle>
                    <div className="flex items-center space-x-3 mt-2">
                      <Badge variant={getUserTypeBadgeVariant(profile.user_type || 'generator')}>
                        {getUserTypeLabel(profile.user_type || 'generator')}
                      </Badge>
                      {profile.is_verified && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          ✓ Verificado
                        </Badge>
                      )}
                      {profile.is_admin && (
                        <Badge variant="destructive">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Rating prominente */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold text-gray-900">
                      {userRating > 0 ? userRating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {ratingCount} {ratingCount === 1 ? 'calificación' : 'calificaciones'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{profile.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Miembro desde {new Date(profile.created_at || '').toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalLotes}</div>
                    <div className="text-xs text-gray-600">Lotes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalProductos}</div>
                    <div className="text-xs text-gray-600">Productos</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalOrdenes}</div>
                    <div className="text-xs text-gray-600">Órdenes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reputación y Reseñas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span>Reputación y Reseñas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ratingCount > 0 ? (
                <div className="space-y-6">
                  {/* Rating centrado */}
                  <div className="text-center">
                    <UserRating userId={userId!} showCount={true} size="lg" />
                  </div>
                  
                  {/* Comentarios recientes */}
                  {recentComments.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Comentarios recientes</h4>
                      <CalificacionesList 
                        calificaciones={recentComments}
                        showDeleteButton={false}
                        defaultLimit={3}
                        showExpandButton={true}
                      />
                      
                      {/* Botón Ver más solo si hay más comentarios que los mostrados */}
                      {calificaciones.length > 3 && (
                        <Collapsible open={showReviews} onOpenChange={setShowReviews}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full">
                              {showReviews ? 'Ocultar todas las reseñas' : `Ver todas las reseñas (${calificaciones.length})`}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-4">
                            <CalificacionesList 
                              calificaciones={calificaciones}
                              showDeleteButton={false}
                            />
                          </CollapsibleContent>
                        </Collapsible>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin calificaciones aún
                  </h3>
                  <p className="text-gray-600">
                    Este usuario aún no ha recibido calificaciones de otros usuarios.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;