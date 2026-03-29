import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, FileText, Calendar, User, Shield, Package, Weight, DollarSign, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import { useAuditoriaEnriquecida } from '@/hooks/useAuditoriaEnriquecida';
import { EntityIdDisplay } from '@/components/ui/entity-id-display';

type AuditoriaAdmin = Database['public']['Tables']['auditoria_admin']['Row'];

interface AuditoriasViewProps {
  auditorias: AuditoriaAdmin[];
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export const AuditoriasView: React.FC<AuditoriasViewProps> = ({ auditorias }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { enrichedAuditorias, loading } = useAuditoriaEnriquecida(auditorias);

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      aprobado: 'bg-green-100 text-green-800',
      rechazado: 'bg-red-100 text-red-800',
      suspendido: 'bg-yellow-100 text-yellow-800',
      activo: 'bg-blue-100 text-blue-800',
      verificado: 'bg-purple-100 text-purple-800',
      delete: 'bg-red-100 text-red-800',
      delete_completely: 'bg-red-200 text-red-900',
    };
    const labels: Record<string, string> = {
      delete: 'Eliminado',
      delete_completely: 'Eliminado completamente',
    };
    return (
      <Badge className={colors[action] || 'bg-gray-100 text-gray-800'}>
        {labels[action] || action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  // Filter auditorias
  const filteredAuditorias = useMemo(() => {
    return enrichedAuditorias.filter(auditoria => {
      // Text search
      const matchesSearch = !searchTerm ||
        auditoria.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.entity_data?.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.entity_data?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.admin_data?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auditoria.user_data?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Entity type filter
      const matchesEntity = entityFilter === 'all' || auditoria.entity_type === entityFilter;

      // Date range filter
      let matchesDate = true;
      if (dateFrom) {
        matchesDate = matchesDate && new Date(auditoria.created_at) >= new Date(dateFrom + 'T00:00:00');
      }
      if (dateTo) {
        matchesDate = matchesDate && new Date(auditoria.created_at) <= new Date(dateTo + 'T23:59:59');
      }

      return matchesSearch && matchesEntity && matchesDate;
    });
  }, [enrichedAuditorias, searchTerm, entityFilter, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAuditorias.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedAuditorias = filteredAuditorias.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEntityFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || entityFilter !== 'all' || dateFrom || dateTo;

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
      {/* Filters */}
      <div className="space-y-3">
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar en acciones, notas o nombres..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={entityFilter} onValueChange={handleFilterChange(setEntityFilter)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Filtrar por entidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las entidades</SelectItem>
              <SelectItem value="usuario">Usuarios</SelectItem>
              <SelectItem value="lote">Lotes</SelectItem>
              <SelectItem value="producto">Productos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date filters */}
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-500">Desde:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
              className="w-40 h-9 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hasta:</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
              className="w-40 h-9 text-sm"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 text-xs">
              Limpiar filtros
            </Button>
          )}
          <div className="ml-auto text-sm text-gray-500">
            {filteredAuditorias.length} de {enrichedAuditorias.length} registros
          </div>
        </div>
      </div>

      {/* Audit cards */}
      <div className="grid gap-4">
        {paginatedAuditorias.map((auditoria) => (
          <Card key={auditoria.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-white py-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {auditoria.entity_data?.imagen && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={auditoria.entity_data.imagen} alt="Entity" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-gray-600" />
                      Acción en {auditoria.entity_type}
                    </CardTitle>
                    <EntityIdDisplay id={auditoria.entity_id} label="ID" className="mb-1" showCopyButton={false} />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(auditoria.created_at), "dd 'de' MMMM yyyy, HH:mm", { locale: es })}
                    </div>
                  </div>
                </div>
                {getActionBadge(auditoria.action)}
              </div>
            </CardHeader>

            <CardContent className="pt-4 pb-4">
              <div className="space-y-3">
                {/* Entity info */}
                {auditoria.entity_type === 'lote' && auditoria.entity_data && (
                  <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                    <h4 className="font-semibold text-xs text-blue-900 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Lote
                    </h4>
                    {auditoria.entity_data.titulo && <p className="text-sm"><span className="font-medium">Título:</span> {auditoria.entity_data.titulo}</p>}
                    {auditoria.entity_data.tipo_residuo && <p className="text-sm"><span className="font-medium">Tipo:</span> {auditoria.entity_data.tipo_residuo}</p>}
                    {auditoria.entity_data.peso_estimado && (
                      <p className="text-sm flex items-center gap-1">
                        <Weight className="h-3 w-3" /> <span className="font-medium">Peso:</span> {auditoria.entity_data.peso_estimado} kg
                      </p>
                    )}
                  </div>
                )}
                {auditoria.entity_type === 'producto' && auditoria.entity_data && (
                  <div className="bg-green-50 p-3 rounded-lg space-y-1">
                    <h4 className="font-semibold text-xs text-green-900 flex items-center gap-1">
                      <Package className="h-3 w-3" /> Producto
                    </h4>
                    {auditoria.entity_data.nombre && <p className="text-sm"><span className="font-medium">Nombre:</span> {auditoria.entity_data.nombre}</p>}
                    {auditoria.entity_data.precio_unidad && (
                      <p className="text-sm flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> <span className="font-medium">Precio:</span> ${auditoria.entity_data.precio_unidad.toLocaleString()} COP
                      </p>
                    )}
                  </div>
                )}
                {auditoria.entity_type === 'usuario' && auditoria.entity_data && (
                  <div className="bg-purple-50 p-3 rounded-lg space-y-1">
                    <h4 className="font-semibold text-xs text-purple-900 flex items-center gap-1">
                      <User className="h-3 w-3" /> Usuario
                    </h4>
                    {auditoria.entity_data.full_name && <p className="text-sm"><span className="font-medium">Nombre:</span> {auditoria.entity_data.full_name}</p>}
                    {auditoria.entity_data.email && <p className="text-sm"><span className="font-medium">Email:</span> {auditoria.entity_data.email}</p>}
                  </div>
                )}

                {/* Admin & User info side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {auditoria.user_data && (
                    <div className="border-l-3 border-blue-400 pl-3">
                      <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1 text-blue-700">
                        <User className="h-3 w-3" />
                        {auditoria.entity_type === 'usuario' ? 'Afectado' : 'Creador'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={auditoria.user_data.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {auditoria.user_data.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{auditoria.user_data.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500">{auditoria.user_data.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {auditoria.admin_data && (
                    <div className="border-l-3 border-orange-400 pl-3">
                      <h4 className="font-semibold text-xs mb-1.5 flex items-center gap-1 text-orange-700">
                        <Shield className="h-3 w-3" /> Administrador
                      </h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={auditoria.admin_data.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {auditoria.admin_data.full_name?.charAt(0) || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{auditoria.admin_data.full_name || 'Admin'}</p>
                          <p className="text-xs text-gray-500">{auditoria.admin_data.email}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status change */}
                {auditoria.previous_status && auditoria.new_status && (
                  <div className="flex items-center gap-3 text-sm bg-gray-50 p-2.5 rounded-lg">
                    <span className="font-medium text-xs">Estado:</span>
                    <Badge variant="outline" className="text-xs">{auditoria.previous_status}</Badge>
                    <span className="text-gray-400">→</span>
                    <Badge variant="outline" className="text-xs">{auditoria.new_status}</Badge>
                  </div>
                )}

                {/* Admin notes */}
                {auditoria.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h4 className="font-semibold text-xs mb-1 text-yellow-900">Notas:</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{auditoria.notes}</p>
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

      {/* Pagination */}
      {filteredAuditorias.length > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Mostrar</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-20 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map(size => (
                  <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">por página</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 mr-3">
              {startIndex + 1}–{Math.min(startIndex + pageSize, filteredAuditorias.length)} de {filteredAuditorias.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {(() => {
              const pages: number[] = [];
              const start = Math.max(1, safeCurrentPage - 2);
              const end = Math.min(totalPages, safeCurrentPage + 2);
              for (let i = start; i <= end; i++) pages.push(i);
              return pages.map(page => (
                <Button
                  key={page}
                  variant={page === safeCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ));
            })()}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
