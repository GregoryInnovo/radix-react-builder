
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Package, Calendar } from 'lucide-react';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { useProductos } from '@/hooks/useProductos';
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
  const { user } = useAuth();
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

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
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">
                {producto.nombre}
              </CardTitle>
              <Badge variant={producto.disponible ? 'default' : 'secondary'}>
                {producto.disponible ? 'Disponible' : 'No disponible'}
              </Badge>
            </div>
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

            {showOwnerActions && producto.user_id === user?.id && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleDisponible(producto)}
                  disabled={loadingIds.has(producto.id)}
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
    </div>
  );
};
