
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Package, Calendar, Image as ImageIcon, Eye } from 'lucide-react';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { ProductImageGallery } from './ProductImageGallery';
import { ProveedorInfo } from './ProveedorInfo';
import { useProductos } from '@/hooks/useProductos';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

interface ProductsListProps {
  productos: Producto[];
  showOwnerActions: boolean;
}

export const ProductsList: React.FC<ProductsListProps> = ({
  productos,
  showOwnerActions
}) => {
  const { updateProducto, deleteProducto } = useProductos();
  const { getMultipleProfiles } = useProfiles();
  const { user } = useAuth();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [profiles, setProfiles] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (!showOwnerActions && productos.length > 0) {
      const userIds = [...new Set(productos.map(p => p.user_id))];
      getMultipleProfiles(userIds).then(profilesData => {
        const profilesMap = new Map();
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, profile);
        });
        setProfiles(profilesMap);
      });
    }
  }, [productos, showOwnerActions, getMultipleProfiles]);

  const handleViewImages = (producto: Producto) => {
    setSelectedProduct(producto);
    setIsGalleryOpen(true);
  };

  const handleToggleDisponible = async (producto: Producto) => {
    setLoadingIds(prev => new Set(prev).add(producto.id));
    try {
      await updateProducto(producto.id, {
        disponible: !producto.disponible
      });
    } finally {
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(producto.id);
        return newSet;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProducto(id);
    }
  };

  if (productos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No hay productos disponibles</h3>
            <p className="text-sm">
              {showOwnerActions 
                ? "Aún no has publicado ningún producto. ¡Publica tu primer producto para comenzar!"
                : "No hay productos disponibles en este momento. ¡Vuelve pronto!"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <Card key={producto.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            {/* Mostrar información del proveedor solo en productos públicos */}
            {!showOwnerActions && profiles.get(producto.user_id) && (
              <ProveedorInfo profile={profiles.get(producto.user_id)} />
            )}
            
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">
                {producto.nombre}
              </CardTitle>
              <div className="flex flex-col gap-1">
                {showOwnerActions && (
                  <Badge variant={
                    producto.status === 'aprobado' ? 'default' : 
                    producto.status === 'rechazado' ? 'destructive' : 
                    producto.status === 'suspendido' ? 'secondary' : 'outline'
                  }>
                    {producto.status === 'aprobado' ? 'Aprobado' : 
                     producto.status === 'rechazado' ? 'Rechazado' : 
                     producto.status === 'suspendido' ? 'Suspendido' : 'Pendiente'}
                  </Badge>
                )}
                <Badge variant={producto.disponible ? 'default' : 'secondary'}>
                  {producto.disponible ? 'Disponible' : 'No disponible'}
                </Badge>
              </div>
            </div>
            
            {/* Precio destacado */}
            {producto.precio_unidad && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xl font-bold text-green-800">
                  $ {producto.precio_unidad.toLocaleString('es-CO')} COP
                </div>
                {producto.incluye_domicilio && producto.costo_domicilio > 0 && (
                  <div className="text-sm text-green-600 mt-1">
                    + $ {producto.costo_domicilio.toLocaleString('es-CO')} COP domicilio
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-sm line-clamp-3">
              {producto.descripcion}
            </p>
            
            {producto.origen_roa && (
              <div className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
                <strong>Origen ROA:</strong> {producto.origen_roa}
              </div>
            )}

            {/* Dirección del vendedor si incluye domicilio */}
            {producto.incluye_domicilio && producto.direccion_vendedor && (
              <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                <strong>Dirección:</strong> {producto.direccion_vendedor}
              </div>
            )}

            {/* Imagen de previsualización */}
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <div className="mb-4 relative cursor-pointer" onClick={() => handleViewImages(producto)}>
                <img
                  src={producto.imagenes[0]}
                  alt={producto.nombre}
                  className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition-opacity"
                />
                {producto.imagenes.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    +{producto.imagenes.length - 1} más
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                  <Eye className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="mb-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Sin imágenes</p>
                </div>
              </div>
            )}

            <div className="flex items-center text-gray-500 text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <span>
                Publicado: {format(new Date(producto.created_at), 'PP', { locale: es })}
              </span>
            </div>

            {producto.imagenes && producto.imagenes.length > 0 && (
              <div className="text-xs text-gray-500">
                {producto.imagenes.length} imagen(es) disponible(s)
              </div>
            )}

            {showOwnerActions && producto.user_id === user?.id && producto.status !== 'rechazado' && producto.status !== 'suspendido' && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleDisponible(producto)}
                  disabled={loadingIds.has(producto.id) || producto.status !== 'aprobado'}
                  className="flex-1"
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  {producto.disponible ? 'Marcar no disponible' : 'Marcar disponible'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(producto.id)}
                  disabled={loadingIds.has(producto.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            {showOwnerActions && producto.user_id === user?.id && (producto.status === 'rechazado' || producto.status === 'suspendido') && (
              <div className="text-center py-2">
                <Badge variant="secondary" className="text-xs">
                  {producto.status === 'rechazado' ? 'Producto rechazado por administración' : 'Producto suspendido por administración'}
                </Badge>
              </div>
            )}

            {!showOwnerActions && producto.disponible && (
              <SolicitarIntercambio
                tipo_item="producto"
                item_id={producto.id}
                proveedor_id={producto.user_id}
              />
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Modal de galería de imágenes */}
      <ProductImageGallery
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        images={selectedProduct?.imagenes || []}
        productTitle={selectedProduct?.nombre || ''}
      />
    </div>
  );
};
