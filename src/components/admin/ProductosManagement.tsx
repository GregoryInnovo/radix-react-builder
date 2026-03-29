import React, { useState } from 'react';
import { Database } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Package, MapPin, DollarSign, Home, CheckCircle, XCircle, Trash2, User, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProfiles } from '@/hooks/useProfiles';
import { Link } from 'react-router-dom';
import { ProductDetailsModal } from '@/components/productos/ProductDetailsModal';
import { EntityIdDisplay } from '@/components/ui/entity-id-display';

type Producto = Database['public']['Tables']['productos']['Row'];

interface ProductosManagementProps {
  productos: Producto[];
  updateEntityStatus: (entityType: string, entityId: string, newStatus: string, notes?: string) => Promise<void>;
  deleteEntity: (entityType: string, entityId: string, notes?: string) => Promise<void>;
}

export const ProductosManagement: React.FC<ProductosManagementProps> = ({ productos, updateEntityStatus, deleteEntity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { getProfileById } = useProfiles();

  // Fetch profiles for producto owners
  React.useEffect(() => {
    const fetchProfiles = async () => {
      const uniqueUserIds = [...new Set(productos.map(p => p.user_id))];
      
      for (const userId of uniqueUserIds) {
        if (!profiles[userId]) {
          const profile = await getProfileById(userId);
          if (profile) {
            setProfiles(prev => ({
              ...prev,
              [userId]: profile
            }));
          }
        }
      }
    };
    
    if (productos.length > 0) {
      fetchProfiles();
    }
  }, [productos, getProfileById]);

  const getStatusBadge = (estado: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {estado?.charAt(0).toUpperCase() + estado?.slice(1) || 'Pendiente'}
      </Badge>
    );
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    await updateEntityStatus('producto', productId, newStatus);
  };

  const handleDelete = async (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto definitivamente? Esta acción no se puede deshacer.')) {
      await deleteEntity('producto', productId);
    }
  };

  const handleViewDetails = (producto: Producto) => {
    setSelectedProducto(producto);
    setShowDetailsModal(true);
  };


  const filteredProductos = productos.filter(producto => {
    const matchesSearch = 
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (!producto.status || producto.status === 'pendiente')) ||
      (statusFilter === 'approved' && producto.status === 'aprobado') ||
      (statusFilter === 'rejected' && producto.status === 'rechazado');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="approved">Aprobados</SelectItem>
            <SelectItem value="rejected">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredProductos.map((producto) => {
          const userProfile = profiles[producto.user_id];
          return (
            <Card key={producto.id} className="p-4">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {producto.nombre}
                    </CardTitle>
                    <EntityIdDisplay id={producto.id} label="ID" showCopyButton={false} />
                  </div>
                  {userProfile && (
                    <Link 
                      to={`/perfil/${userProfile.id}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {userProfile.full_name || userProfile.email || 'Usuario'}
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {producto.descripcion}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {producto.precio_unidad && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>${producto.precio_unidad.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {producto.incluye_domicilio && (
                    <div className="flex items-center gap-1">
                      <Home className="h-4 w-4 text-blue-600" />
                      <span>Incluye domicilio</span>
                      {producto.costo_domicilio && producto.costo_domicilio > 0 && (
                        <span className="text-gray-500">
                          (${producto.costo_domicilio.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {producto.direccion_vendedor && (
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-xs">{producto.direccion_vendedor}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(producto.created_at), 'dd/MM/yyyy', { locale: es })}
                  </div>
                  <div>{getStatusBadge(producto.status || 'pendiente')}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Disponible: {producto.disponible ? 'Sí' : 'No'}</span>
                    <span>•</span>
                    <span>Imágenes: {producto.imagenes?.length || 0}</span>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(producto)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Ver Detalles
                    </Button>
                    {producto.status === 'pendiente' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(producto.id, 'aprobado')}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(producto.id, 'rechazado')}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Rechazar
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(producto.id)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Details Modal */}
      {selectedProducto && (
        <ProductDetailsModal
          producto={selectedProducto}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProducto(null);
          }}
        />
      )}
    </div>
  );
};