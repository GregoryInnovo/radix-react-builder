
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdmin } from '@/hooks/useAdmin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, User, Mail, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UsersManagementProps {
  users: Profile[];
}

export const UsersManagement: React.FC<UsersManagementProps> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { updateEntityStatus } = useAdmin();

  const getStatusBadge = (user: Profile) => {
    if (user.is_admin) {
      return <Badge className="bg-purple-100 text-purple-800">Administrador</Badge>;
    }
    if (user.is_active === false) {
      return <Badge variant="destructive">Suspendido</Badge>;
    }
    if (user.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verificado</Badge>;
    }
    return <Badge variant="secondary">Activo</Badge>;
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    await updateEntityStatus('usuario', userId, newStatus);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active !== false) ||
      (statusFilter === 'suspended' && user.is_active === false) ||
      (statusFilter === 'verified' && user.is_verified) ||
      (statusFilter === 'admin' && user.is_admin);
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nombre o email..."
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
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="suspended">Suspendidos</SelectItem>
            <SelectItem value="verified">Verificados</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {user.full_name || 'Usuario sin nombre'}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </div>
                </div>
                {getStatusBadge(user)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Registrado: {format(new Date(user.created_at || ''), 'PP', { locale: es })}</span>
                </div>
                <div>
                  <span className="font-medium">Tipo: </span>
                  {user.user_type || 'No especificado'}
                </div>
                {user.phone && (
                  <div>
                    <span className="font-medium">Teléfono: </span>
                    {user.phone}
                  </div>
                )}
                {user.address && (
                  <div>
                    <span className="font-medium">Dirección: </span>
                    {user.address}
                  </div>
                )}
              </div>

              {!user.is_admin && (
                <div className="flex gap-2">
                  {user.is_active !== false && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleStatusChange(user.id, 'suspendido')}
                    >
                      Suspender
                    </Button>
                  )}
                  {user.is_active === false && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusChange(user.id, 'activo')}
                    >
                      Restaurar
                    </Button>
                  )}
                  {!user.is_verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange(user.id, 'verificado')}
                    >
                      Verificar
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
