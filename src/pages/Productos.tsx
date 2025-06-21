
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search as SearchIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProductForm } from '@/components/productos/ProductForm';
import { ProductsList } from '@/components/productos/ProductsList';
import { useProductos } from '@/hooks/useProductos';
import { useAuth } from '@/hooks/useAuth';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const Productos = () => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const { productos, loading, refreshProductos } = useProductos();
  const { user } = useAuth();

  useEffect(() => {
    refreshProductos(activeTab === 'my-products');
  }, [activeTab]);

  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.origen_roa && producto.origen_roa.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleFormSuccess = () => {
    setShowForm(false);
    refreshProductos(activeTab === 'my-products');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Productos ROA
                </h1>
                <p className="text-gray-600">
                  Descubre productos creados a partir de residuos orgánicos aprovechables
                </p>
              </div>

              <Sheet open={showForm} onOpenChange={setShowForm}>
                <SheetTrigger asChild>
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Producto
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Nuevo Producto</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <ProductForm
                      onSuccess={handleFormSuccess}
                      onCancel={() => setShowForm(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="public">Productos Públicos</TabsTrigger>
                <TabsTrigger value="my-products">Mis Productos</TabsTrigger>
              </TabsList>

              <TabsContent value="public" className="space-y-6">
                <div className="text-sm text-gray-600">
                  Mostrando {filteredProductos.length} producto(s) disponible(s)
                </div>
                <ProductsList 
                  productos={filteredProductos}
                  showOwnerActions={false}
                />
              </TabsContent>

              <TabsContent value="my-products" className="space-y-6">
                <div className="text-sm text-gray-600">
                  Mostrando {filteredProductos.length} de tus producto(s)
                </div>
                <ProductsList 
                  productos={filteredProductos}
                  showOwnerActions={true}
                />
              </TabsContent>
            </Tabs>

            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Productos;
