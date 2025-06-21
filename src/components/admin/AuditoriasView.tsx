
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, FileText, Calendar, User } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AuditoriaAdmin = Database['public']['Tables']['auditoria_admin']['Row'];

interface AuditoriasViewProps {
  auditorias: AuditoriaAdmin[];
}

export const AuditoriasView: React.FC<AuditoriasViewProps> = ({ auditorias }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

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

  const filteredAuditorias = auditorias.filter(auditoria => {
    const matchesSearch = 
      auditoria.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auditoria.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEntity = 
      entityFilter === 'all' ||
      auditoria.entity_type === entityFilter;
    
    return matchesSearch && matchesEntity;
  });

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
          <Card key={auditoria.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Acción en {auditoria.entity_type}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(auditoria.created_at), 'PP', { locale: es })}
                    </div>
                  </div>
                </div>
                {getActionBadge(auditoria.action)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>Admin ID: </span>
                    <span className="font-mono text-xs">{auditoria.admin_id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Entidad ID: </span>
                    <span className="font-mono text-xs">{auditoria.entity_id}</span>
                  </div>
                </div>

                {auditoria.previous_status && auditoria.new_status && (
                  <div className="flex items-center gap-4 text-sm">
                    <span>Estado anterior: </span>
                    <Badge variant="outline">{auditoria.previous_status}</Badge>
                    <span>→</span>
                    <span>Estado nuevo: </span>
                    <Badge variant="outline">{auditoria.new_status}</Badge>
                  </div>
                )}

                {auditoria.notes && (
                  <div>
                    <span className="font-medium">Notas: </span>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                      {auditoria.notes}
                    </p>
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
