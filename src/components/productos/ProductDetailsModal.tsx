import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, MapPin, Package, Home, X } from 'lucide-react';
import { ProductImageGallery } from './ProductImageGallery';
import { ProveedorInfo } from './ProveedorInfo';
import { SolicitarIntercambio } from '@/components/ordenes/SolicitarIntercambio';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto;
  userProfile?: any;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  isOpen,
  onClose,
  producto,
  userProfile
}) => {
  const [showImageGallery, setShowImageGallery] = useState(false);
  const { user } = useAuth();
  const isOwner = user?.id === producto.user_id;

  const images = producto.imagenes || [];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-bold text-green-800 pr-8">
                {producto.nombre}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status and Availability */}
            <div className="flex items-center gap-2">
              <Badge variant={producto.disponible ? "default" : "secondary"}>
                {producto.disponible ? 'Disponible' : 'No disponible'}
              </Badge>
              {producto.status && (
                <Badge variant={producto.status === 'aprobado' ? 'default' : 'secondary'}>
                  {producto.status}
                </Badge>
              )}
            </div>

            {/* Images */}
            {images.length > 0 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.slice(0, 6).map((image, index) => (
                    <div 
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setShowImageGallery(true)}
                    >
                      <img
                        src={image}
                        alt={`Imagen ${index + 1} del producto`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {index === 5 && images.length > 6 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            +{images.length - 6} más
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {images.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageGallery(true)}
                    className="mt-3 w-full"
                  >
                    Ver todas las imágenes ({images.length})
                  </Button>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {producto.descripcion}
              </p>
            </div>

            {/* Pricing Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Precio por unidad:</span>
                  <span className="font-semibold">${producto.precio_unidad?.toLocaleString()} COP</span>
                </div>

                {producto.incluye_domicilio && (
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Incluye domicilio</span>
                    {producto.costo_domicilio && producto.costo_domicilio > 0 && (
                      <span className="font-semibold">
                        (+${producto.costo_domicilio.toLocaleString()} COP)
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {producto.direccion_vendedor && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600 block">Dirección:</span>
                      <span className="font-semibold text-sm">{producto.direccion_vendedor}</span>
                    </div>
                  </div>
                )}

                {producto.origen_roa && (
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-600 block">Origen R.O.A:</span>
                      <span className="font-semibold text-sm">{producto.origen_roa}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {(producto.categoria_funcionalidad && producto.categoria_funcionalidad.length > 0) ||
             (producto.categoria_tipo && producto.categoria_tipo.length > 0) ? (
              <div className="space-y-3">
                {producto.categoria_funcionalidad && producto.categoria_funcionalidad.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Funcionalidad:</h4>
                    <div className="flex flex-wrap gap-2">
                      {producto.categoria_funcionalidad.map((cat, idx) => (
                        <Badge key={idx} variant="secondary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {producto.categoria_tipo && producto.categoria_tipo.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tipo de producto:</h4>
                    <div className="flex flex-wrap gap-2">
                      {producto.categoria_tipo.map((cat, idx) => (
                        <Badge key={idx} variant="outline">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Seller Info */}
            {userProfile && (
              <div>
                <h3 className="font-semibold mb-2">Vendedor</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <ProveedorInfo profile={userProfile} />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 border-t">
              {!isOwner && producto.disponible && (
                <SolicitarIntercambio
                  tipo_item="producto"
                  item_id={producto.id}
                  proveedor_id={producto.user_id}
                  disabled={false}
                />
              )}

              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Modal */}
      <ProductImageGallery
        isOpen={showImageGallery}
        onClose={() => setShowImageGallery(false)}
        images={images}
        productTitle={producto.nombre}
      />
    </>
  );
};
