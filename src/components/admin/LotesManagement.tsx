
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Package, MapPin, Calendar, Weight } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];

interface LotesManagementProps {
  lotes: Lote[];
}

export const LotesManagement: React.FC<LotesManagementProps> = ({ lotes }) => {
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

  const getResiduoType = (tipo: string) => {
    const types = {
      cascara_fruta: 'Cáscara de fruta',
      posos_cafe: 'Posos de café',
      restos_vegetales: 'Restos vegetales',
      cascara_huevo: 'Cáscara de huevo',
      restos_cereales: 'Restos de cereales',
      otros: 'Otros',
    };
    return types[tipo as keyof typeof types] || tipo;
  };

  const handleStatusChange = async (loteId: string, newStatus: string) => {
    await updateEntityStatus('lote', loteId, newStatus);
  };

  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = 
      getResiduoType(lote.tipo_residuo).toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lote.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && (!lote.status || lote.status === 'pendiente')) ||
      (statusFilter === 'approved' && lote.status === 'aprobado') ||
      (statusFilter === 'rejected' && lote.status === 'rechazado');
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar lotes..."
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
        {filteredLotes.map((lote) => (
          <Card key={lote.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {getResiduoType(lote.tipo_residuo)}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(lote.created_at || ''), 'PP', { locale: es })}
                    </div>
                  </div>
                </div>
                {getStatusBadge(lote.status || 'pendiente')}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-gray-500" />
                  <span>Peso: {lote.peso_estimado} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>Estado: {lote.estado}</span>
                </div>
                {lote.fecha_disponible && (
                  <div>
                    <span className="font-medium">Disponible: </span>
                    {format(new Date(lote.fecha_disponible), 'PP', { locale: es })}
                  </div>
                )}
                {lote.direccion && (
                  <div>
                    <span className="font-medium">Dirección: </span>
                    {lote.direccion}
                  </div>
                )}
              </div>

              {lote.descripcion && (
                <div className="mb-4">
                  <span className="font-medium">Descripción: </span>
                  <p className="text-sm text-gray-600 mt-1">{lote.descripcion}</p>
                </div>
              )}

              <div className="flex gap-2">
                {(!lote.status || lote.status === 'pendiente') && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(lote.id, 'aprobado')}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(lote.id, 'rechazado')}
                    >
                      Rechazar
                    </Button>
                  </>
                )}
                {lote.status === 'aprobado' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleStatusChange(lote.id, 'rechazado')}
                  >
                    Rechazar
                  </Button>
                )}
                {lote.status === 'rechazado' && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange(lote.id, 'aprobado')}
                  >
                    Aprobar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
