import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, FileText, Calendar, User, Shield, Package, Weight, DollarSign } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useAuditoriaEnriquecida } from '@/hooks/useAuditoriaEnriquecida';
import { EntityIdDisplay } from '@/components/ui/entity-id-display';

type AuditoriaAdmin = Database['public']['Tables']['auditoria_admin']['Row'];

interface AuditoriasViewProps {
  auditorias: AuditoriaAdmin[];
}

export const AuditoriasView: React.FC<AuditoriasViewProps> = ({ auditorias }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const { enrichedAuditorias, loading } = useAuditoriaEnriquecida(auditorias);

  const getActionBadge = (action: string) => {
    const colors = {
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
      suspendido: 'bg-yellow-100 text-yellow-800',
      activo: 'bg-blue-100 text-blue-800',
      verificado: 'bg-purple-100 text-purple-800',
    };
    return (
      <Badge className={colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  const filteredAuditorias = enrichedAuditorias.filter(auditoria => {
    const matchesSearch = 
      auditoria.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auditoria.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auditoria.entity_data?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auditoria.entity_data?.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = 
      entityFilter === 'all' ||
      auditoria.entity_type === entityFilter;
    
    return matchesSearch && matchesEntity;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en acciones o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por entidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="usuario">Usuarios</SelectItem>
            <SelectItem value="lote">Lotes</SelectItem>
            <SelectItem value="producto">Productos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredAuditorias.map((auditoria) => (
          <Card key={auditoria.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail */}
                  {auditoria.entity_data?.imagen && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={auditoria.entity_data.imagen}
                        alt="Entity"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      Acción en {auditoria.entity_type}
                    </CardTitle>
                    
                    <EntityIdDisplay 
                      id={auditoria.entity_id} 
                      label="ID de la entidad"
                      className="mb-2"
                    />
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(auditoria.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                    </div>
                  </div>
                </div>
                {getActionBadge(auditoria.action)}
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Información de la entidad */}
                {auditoria.entity_type === 'lote' && auditoria.entity_data && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-blue-900 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Detalles del Lote
                    </h4>
                    {auditoria.entity_data.titulo && (
                      <p className="text-sm">
                        <span className="font-medium">Título:</span> {auditoria.entity_data.titulo}
                      </p>
                    )}
                    {auditoria.entity_data.tipo_residuo && (
                      <p className="text-sm">
                        <span className="font-medium">Tipo:</span> {auditoria.entity_data.tipo_residuo}
                      </p>
                    )}
                    {auditoria.entity_data.peso_estimado && (
                      <p className="text-sm flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        <span className="font-medium">Peso:</span> {auditoria.entity_data.peso_estimado} kg
                      </p>
                    )}
                  </div>
                )}

                {auditoria.entity_type === 'producto' && auditoria.entity_data && (
                  <div className="bg-green-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-green-900 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Detalles del Producto
                    </h4>
                    {auditoria.entity_data.nombre && (
                      <p className="text-sm">
                        <span className="font-medium">Nombre:</span> {auditoria.entity_data.nombre}
                      </p>
                    )}
                    {auditoria.entity_data.precio_unidad && (
                      <p className="text-sm flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span className="font-medium">Precio:</span> ${auditoria.entity_data.precio_unidad.toLocaleString()} COP
                      </p>
                    )}
                  </div>
                )}

                {auditoria.entity_type === 'usuario' && auditoria.entity_data && (
                  <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                    <h4 className="font-semibold text-sm text-purple-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Detalles del Usuario
                    </h4>
                    {auditoria.entity_data.full_name && (
                      <p className="text-sm">
                        <span className="font-medium">Nombre:</span> {auditoria.entity_data.full_name}
                      </p>
                    )}
                    {auditoria.entity_data.email && (
                      <p className="text-sm">
                        <span className="font-medium">Email:</span> {auditoria.entity_data.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Usuario creador/afectado */}
                {auditoria.user_data && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Usuario {auditoria.entity_type === 'usuario' ? 'Afectado' : 'Creador'}:
                    </h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={auditoria.user_data.avatar_url || undefined} />
                        <AvatarFallback>
                          {auditoria.user_data.full_name?.charAt(0) || auditoria.user_data.email?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {auditoria.user_data.full_name || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-gray-500">{auditoria.user_data.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin que realizó la acción */}
                {auditoria.admin_data && (
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-600" />
                      Administrador que realizó la acción:
                    </h4>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={auditoria.admin_data.avatar_url || undefined} />
                        <AvatarFallback>
                          {auditoria.admin_data.full_name?.charAt(0) || auditoria.admin_data.email?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {auditoria.admin_data.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500">{auditoria.admin_data.email}</p>
                        <EntityIdDisplay 
                          id={auditoria.user_id} 
                          label="ID Usuario"
                          showCopyButton={false}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Cambio de estado */}
                {auditoria.previous_status && auditoria.new_status && (
                  <div className="flex items-center gap-4 text-sm bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">Cambio de estado:</span>
                    <Badge variant="outline">{auditoria.previous_status}</Badge>
                    <span className="text-gray-500">→</span>
                    <Badge variant="outline">{auditoria.new_status}</Badge>
                  </div>
                )}

                {/* Notas del admin */}
                {auditoria.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-sm mb-2 text-yellow-900">Notas del Administrador:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {auditoria.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredAuditorias.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No se encontraron registros de auditoría que coincidan con los filtros.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
