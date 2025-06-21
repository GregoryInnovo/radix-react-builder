
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/hooks/useAdmin';
import { UsersManagement } from './UsersManagement';
import { LotesManagement } from './LotesManagement';
import { ProductosManagement } from './ProductosManagement';
import { CalificacionesView } from './CalificacionesView';
import { OrdenesView } from './OrdenesView';
import { AuditoriasView } from './AuditoriasView';
import { Users, Package, ShoppingBag, Star, ClipboardList, FileText } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    profiles, 
    lotes, 
    productos, 
    calificaciones, 
    ordenes, 
    auditorias,
    loading 
  } = useAdmin();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="ml-4 text-gray-600">Cargando panel administrativo...</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuarios ({profiles.length})
        </TabsTrigger>
        <TabsTrigger value="lotes" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Lotes ({lotes.length})
        </TabsTrigger>
        <TabsTrigger value="productos" className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Productos ({productos.length})
        </TabsTrigger>
        <TabsTrigger value="calificaciones" className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Calificaciones ({calificaciones.length})
        </TabsTrigger>
        <TabsTrigger value="ordenes" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Órdenes ({ordenes.length})
        </TabsTrigger>
        <TabsTrigger value="auditoria" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Auditoría ({auditorias.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users">
        <UsersManagement users={profiles} />
      </TabsContent>
      
      <TabsContent value="lotes">
        <LotesManagement lotes={lotes} />
      </TabsContent>
      
      <TabsContent value="productos">
        <ProductosManagement productos={productos} />
      </TabsContent>
      
      <TabsContent value="calificaciones">
        <CalificacionesView calificaciones={calificaciones} />
      </TabsContent>
      
      <TabsContent value="ordenes">
        <OrdenesView ordenes={ordenes} />
      </TabsContent>
      
      <TabsContent value="auditoria">
        <AuditoriasView auditorias={auditorias} />
      </TabsContent>
    </Tabs>
  );
};
