
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { useProductos } from '@/hooks/useProductos';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

interface ProductsListProps {
  productos: Producto[];
  onEdit?: (producto: Producto) => void;
  showOwnerActions?: boolean;
}

export const ProductsList: React.FC<ProductsListProps> = ({ 
  productos, 
  onEdit, 
  showOwnerActions = false 
}) => {
  const { updateProducto, deleteProducto } = useProductos();
  const { user } = useAuth();

  const handleToggleAvailability = async (producto: Producto) => {
    await updateProducto(producto.id, { disponible: !producto.disponible });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProducto(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (productos.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Eye className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay productos disponibles
          </h3>
          <p className="text-gray-500 text-center">
            {showOwnerActions 
              ? 'Aún no has publicado ningún producto. ¡Crea tu primer producto!'
              : 'No hay productos publicados en este momento.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {productos.map((producto) => (
        <Card key={producto.id} className="overflow-hidden">
          <div className="aspect-video relative">
            {producto.imagenes && producto.imagenes.length > 0 ? (
              <img
                src={producto.imagenes[0]}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <Badge variant={producto.disponible ? "default" : "secondary"}>
                {producto.disponible ? "Disponible" : "No disponible"}
              </Badge>
            </div>
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{producto.nombre}</CardTitle>
            <CardDescription className="line-clamp-2">
              {producto.descripcion}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {producto.origen_roa && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Origen ROA:</span> {producto.origen_roa}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              Publicado el {formatDate(producto.created_at)}
            </div>

            {producto.imagenes && producto.imagenes.length > 1 && (
              <div className="text-sm text-gray-500">
                +{producto.imagenes.length - 1} imagen(es) más
              </div>
            )}

            {showOwnerActions && user && producto.user_id === user.id && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAvailability(producto)}
                  className="flex-1"
                >
                  {producto.disponible ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Mostrar
                    </>
                  )}
                </Button>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(producto)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(producto.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
