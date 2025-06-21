
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, ClipboardList, Calendar, Package, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Orden = Database['public']['Tables']['ordenes']['Row'];

interface OrdenesViewProps {
  ordenes: Orden[];
}

export const OrdenesView: React.FC<OrdenesViewProps> = ({ ordenes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (estado: string) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      aceptada: 'bg-green-100 text-green-800',
      completada: 'bg-blue-100 text-blue-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return (
      <Badge className={colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const filteredOrdenes = ordenes.filter(orden => {
    const matchesSearch = 
      orden.mensaje_solicitud?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.mensaje_respuesta?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      orden.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en mensajes..."
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
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="aceptada">Aceptada</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredOrdenes.map((orden) => (
          <Card key={orden.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <ClipboardList className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Orden de {orden.tipo_item}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(orden.created_at), 'PP', { locale: es })}
                    </div>
                  </div>
                </div>
                {getStatusBadge(orden.estado)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-500" />
                    <span>Cantidad: {orden.cantidad_solicitada}</span>
                  </div>
                  {orden.fecha_propuesta_retiro && (
                    <div>
                      <span className="font-medium">Retiro propuesto: </span>
                      {format(new Date(orden.fecha_propuesta_retiro), 'PP', { locale: es })}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Solicitante ID: </span>
                    <span className="font-mono text-xs">{orden.solicitante_id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Proveedor ID: </span>
                    <span className="font-mono text-xs">{orden.proveedor_id}</span>
                  </div>
                </div>

                {orden.mensaje_solicitud && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <MessageSquare className="h-4 w-4" />
                      Mensaje de solicitud:
                    </div>
                    <p className="text-sm text-gray-700">{orden.mensaje_solicitud}</p>
                  </div>
                )}

                {orden.mensaje_respuesta && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium mb-1">
                      <MessageSquare className="h-4 w-4" />
                      Respuesta del proveedor:
                    </div>
                    <p className="text-sm text-gray-700">{orden.mensaje_respuesta}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
