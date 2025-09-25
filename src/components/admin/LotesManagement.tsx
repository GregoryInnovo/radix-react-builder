
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Package, MapPin, Calendar, Weight, User, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { Link } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'] & {
  tipos_residuo?: {
    id: string;
    nombre: string;
    descripcion: string | null;
  };
};

type Profile = Database['public']['Tables']['profiles']['Row'];

interface LotesManagementProps {
  lotes: Lote[];
}

export const LotesManagement: React.FC<LotesManagementProps> = ({ lotes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { updateEntityStatus, deleteEntity, profiles } = useAdmin();
  const { getProfileById } = useProfiles();

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

  const getResiduoType = (lote: Lote) => {
    if (lote.tipos_residuo) {
      return lote.tipos_residuo.descripcion || lote.tipos_residuo.nombre;
    }
    
    // Fallback para datos antiguos
    const types = {
      cascara_fruta: 'Cáscara de fruta',
      posos_cafe: 'Posos de café',
      restos_vegetales: 'Restos vegetales',
      cascara_huevo: 'Cáscara de huevo',
      restos_cereales: 'Restos de cereales',
      otros: 'Otros',
    };
    return 'Tipo no disponible';
  };

  const handleStatusChange = async (loteId: string, newStatus: string) => {
    await updateEntityStatus('lote', loteId, newStatus);
  };

  const handleDelete = async (loteId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este lote definitivamente? Esta acción no se puede deshacer.')) {
      await deleteEntity('lote', loteId);
    }
  };

  const getUserProfile = (userId: string): Profile | null => {
    return profiles.find(p => p.id === userId) || null;
  };

  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = 
      getResiduoType(lote).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {filteredLotes.map((lote) => {
          const userProfile = getUserProfile(lote.user_id);
          return (
            <Card key={lote.id} className="p-4">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {/* Imagen thumbnail del lote */}
                    {lote.imagenes && lote.imagenes.length > 0 && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={lote.imagenes[0]}
                          alt="Lote"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {lote.titulo || getResiduoType(lote)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(lote.created_at || ''), 'PP', { locale: es })}
                      </div>
                    </div>
                  </div>
                  {userProfile && (
                    <Link 
                      to={`/user/${userProfile.id}`}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {userProfile.full_name || 'Usuario'}
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {lote.descripcion && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {lote.descripcion}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Weight className="h-4 w-4 text-gray-500" />
                    <span>Peso: {lote.peso_estimado} kg</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>Estado: {lote.estado}</span>
                  </div>
                  
                  {lote.fecha_vencimiento && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Vence: {format(new Date(lote.fecha_vencimiento), 'PP', { locale: es })}</span>
                    </div>
                  )}
                  
                  {lote.direccion && (
                    <div className="flex items-center gap-1 col-span-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="text-xs">{lote.direccion}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(lote.created_at || ''), 'dd/MM/yyyy', { locale: es })}
                  </div>
                  <div>{getStatusBadge(lote.status || 'pendiente')}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Imágenes: {lote.imagenes?.length || 0}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {lote.status === 'pendiente' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(lote.id, 'aprobado')}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(lote.id, 'rechazado')}
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
                      onClick={() => handleDelete(lote.id)}
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
    </div>
  );
};
