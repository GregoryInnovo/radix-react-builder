import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProductsList } from '@/components/productos/ProductsList';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Package } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

const UserProducts = () => {
  const { userId } = useParams<{ userId: string }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserProductos = async () => {
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

        // Fetch user products (only approved and available)
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'aprobado')
          .eq('disponible', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProductos(data || []);
      } catch (error) {
        console.error('Error fetching productos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProductos();
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
              Productos de {userName}
            </h1>
            <p className="text-gray-600">
              Productos públicos disponibles de este usuario
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : productos.length > 0 ? (
            <ProductsList productos={productos} showOwnerActions={false} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin productos disponibles
                </h3>
                <p className="text-gray-600">
                  Este usuario no tiene productos disponibles en este momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProducts;
