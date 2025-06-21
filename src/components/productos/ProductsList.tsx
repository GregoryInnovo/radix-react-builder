
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useProductos } from '@/hooks/useProductos';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { useAuth } from '@/hooks/useAuth';

interface ProductsListProps {
  showActions?: boolean;
  onEdit?: (producto: any) => void;
}

export const ProductsList: React.FC<ProductsListProps> = ({ showActions = true, onEdit }) => {
  const { productos, loading, deleteProducto, updateProducto } = useProductos();
  const { user } = useAuth();

  const toggleDisponibilidad = async (producto: any) => {
    await updateProducto(producto.id, {
      disponible: !producto.disponible
    });
  };

  if (loading) {
    return <div className="text-center p-8">Cargando productos...</div>;
  }

  if (productos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay productos disponibles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {productos.map((producto) => {
        const isOwner = user?.id === producto.user_id;
        
        return (
          <Card key={producto.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                <Badge className={producto.disponible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {producto.disponible ? 'Disponible' : 'No disponible'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {producto.imagenes.length > 0 && (
                <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={producto.imagenes[0]}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-gray-700 line-clamp-3">
                {producto.descripcion}
              </p>

              {producto.origen_roa && (
                <div className="text-xs text-gray-500">
                  <span className="font-medium">Origen ROA:</span> {producto.origen_roa}
                </div>
              )}

              <div className="text-xs text-gray-400">
                Publicado: {format(new Date(producto.created_at), 'PP', { locale: es })}
              </div>

              {showActions && (
                <div className="flex gap-2 pt-2">
                  {isOwner ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDisponibilidad(producto)}
                        className="flex-1"
                      >
                        {producto.disponible ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ocultar
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Mostrar
                          </>
                        )}
                      </Button>
                      {onEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(producto)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProducto(producto.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    producto.disponible && (
                      <SolicitarIntercambio
                        tipo_item="producto"
                        item_id={producto.id}
                        proveedor_id={producto.user_id}
                      />
                    )
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
