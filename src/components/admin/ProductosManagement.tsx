
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, ShoppingBag, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

interface ProductosManagementProps {
  productos: Producto[];
}

export const ProductosManagement: React.FC<ProductosManagementProps> = ({ productos }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { updateEntityStatus } = useAdmin();

  const getStatusBadge = (status: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pendiente'}
      </Badge>
    );
  };

  const handleStatusChange = async (productoId: string, newStatus: string) => {
    await updateEntityStatus('producto', productoId, newStatus);
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
        {filteredProductos.map((producto) => (
          <Card key={producto.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(producto.created_at), 'PP', { locale: es })}
                    </div>
                  </div>
                </div>
                {getStatusBadge(producto.status || 'pendiente')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Descripción: </span>
                  <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                </div>

                {producto.origen_roa && (
                  <div>
                    <span className="font-medium">Origen ROA: </span>
                    <span className="text-sm">{producto.origen_roa}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    producto.disponible 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {producto.disponible ? 'Disponible' : 'No disponible'}
                  </span>
                  
                  {producto.imagenes && producto.imagenes.length > 0 && (
                    <span className="text-gray-500">
                      {producto.imagenes.length} imagen(es)
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {(!producto.status || producto.status === 'pendiente') && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleStatusChange(producto.id, 'aprobado')}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange(producto.id, 'rechazado')}
                      >
                        Rechazar
                      </Button>
                    </>
                  )}
                  {producto.status === 'aprobado' && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(producto.id, 'rechazado')}
                    >
                      Rechazar
                    </Button>
                  )}
                  {producto.status === 'rechazado' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(producto.id, 'aprobado')}
                    >
                      Aprobar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
