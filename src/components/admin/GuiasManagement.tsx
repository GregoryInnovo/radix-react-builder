import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EntityIdDisplay } from '@/components/ui/entity-id-display';
import { useGuias } from '@/hooks/useGuias';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface GuiasManagementProps {
  guias: any[];
}

export const GuiasManagement = ({ guias }: GuiasManagementProps) => {
  const { updateGuia, deleteGuia, isUpdating, isDeleting } = useGuias();
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  
  // Estados para dialogs
  const [selectedGuia, setSelectedGuia] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [guiaToToggle, setGuiaToToggle] = useState<any>(null);
  const [guiaToDelete, setGuiaToDelete] = useState<any>(null);

  // Filtrar guías
  const filteredGuias = guias.filter(guia => {
    const matchesSearch = guia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guia.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = tipoFilter === 'all' || guia.tipo === tipoFilter;
    const matchesEstado = estadoFilter === 'all' || 
                          (estadoFilter === 'activa' && guia.activa) ||
                          (estadoFilter === 'inactiva' && !guia.activa);
    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Handlers
  const handleEdit = (guia: any) => {
    setSelectedGuia(guia);
    setShowEditDialog(true);
  };

  const handleToggleStatus = (guia: any) => {
    setGuiaToToggle(guia);
    setShowToggleDialog(true);
  };

  const handleDeleteClick = (guia: any) => {
    setGuiaToDelete(guia);
    setShowDeleteDialog(true);
  };

  const confirmToggleStatus = async () => {
    if (guiaToToggle) {
      await updateGuia({
        id: guiaToToggle.id,
        activa: !guiaToToggle.activa
      });
      setShowToggleDialog(false);
      setGuiaToToggle(null);
    }
  };

  const confirmDelete = async () => {
    if (guiaToDelete) {
      await deleteGuia(guiaToDelete.id);
      setShowDeleteDialog(false);
      setGuiaToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    if (selectedGuia) {
      await updateGuia(selectedGuia);
      setShowEditDialog(false);
      setSelectedGuia(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Guías</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Buscar por título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:w-1/3"
          />
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="articulo">Artículo</SelectItem>
              <SelectItem value="infografia">Infografía</SelectItem>
            </SelectContent>
          </Select>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="md:w-1/4">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="activa">Activas</SelectItem>
              <SelectItem value="inactiva">Inactivas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filteredGuias.length} {filteredGuias.length === 1 ? 'guía encontrada' : 'guías encontradas'}
        </p>

        {/* Lista de guías */}
        <div className="space-y-4">
          {filteredGuias.map((guia) => (
            <Card key={guia.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <EntityIdDisplay id={guia.id} />
                      <h3 className="font-semibold">{guia.titulo}</h3>
                      <Badge variant={guia.activa ? "default" : "secondary"}>
                        {guia.activa ? "Activa" : "Inactiva"}
                      </Badge>
                      {guia.destacada && (
                        <Badge variant="outline">⭐ Destacada</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {guia.descripcion}
                    </p>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>Tipo: {guia.tipo}</span>
                      <span>•</span>
                      <span>Vistas: {guia.vistas || 0}</span>
                      <span>•</span>
                      <span>{new Date(guia.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* 3 BOTONES DE ACCIÓN */}
                  <div className="flex gap-2 flex-wrap">
                    {/* 1. EDITAR */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(guia)}
                      disabled={isUpdating}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>

                    {/* 2. DESACTIVAR/ACTIVAR */}
                    <Button
                      size="sm"
                      variant={guia.activa ? "secondary" : "default"}
                      onClick={() => handleToggleStatus(guia)}
                      disabled={isUpdating}
                    >
                      {guia.activa ? (
                        <>
                          <PowerOff className="w-4 h-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Power className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>

                    {/* 3. ELIMINAR */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(guia)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredGuias.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No se encontraron guías con los filtros seleccionados
            </p>
          )}
        </div>

        {/* DIALOG DE EDICIÓN */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Guía</DialogTitle>
            </DialogHeader>
            {selectedGuia && (
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={selectedGuia.titulo}
                    onChange={(e) => setSelectedGuia({ ...selectedGuia, titulo: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Descripción (máx. 300 caracteres)</Label>
                  <Textarea
                    value={selectedGuia.descripcion}
                    onChange={(e) => setSelectedGuia({ ...selectedGuia, descripcion: e.target.value })}
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedGuia.descripcion?.length || 0}/300 caracteres
                  </p>
                </div>
                <div>
                  <Label>Contenido</Label>
                  <Textarea
                    value={selectedGuia.contenido}
                    onChange={(e) => setSelectedGuia({ ...selectedGuia, contenido: e.target.value })}
                    rows={6}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={selectedGuia.destacada}
                      onCheckedChange={(checked) => setSelectedGuia({ ...selectedGuia, destacada: checked })}
                    />
                    <Label>Destacada</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isUpdating}>
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* MODAL DE CONFIRMACIÓN: DESACTIVAR/ACTIVAR */}
        <ConfirmModal
          isOpen={showToggleDialog}
          title={guiaToToggle?.activa ? "Desactivar Guía" : "Activar Guía"}
          message={
            guiaToToggle?.activa
              ? "¿Estás seguro de que deseas desactivar esta guía? No será visible en el apartado público, pero podrás reactivarla en cualquier momento."
              : "¿Estás seguro de que deseas activar esta guía? Será visible públicamente en el apartado de Guías."
          }
          onConfirm={confirmToggleStatus}
          onCancel={() => {
            setShowToggleDialog(false);
            setGuiaToToggle(null);
          }}
          confirmLabel={guiaToToggle?.activa ? "Desactivar" : "Activar"}
          variant={guiaToToggle?.activa ? "default" : "default"}
          isLoading={isUpdating}
        />

        {/* MODAL DE CONFIRMACIÓN: ELIMINAR PERMANENTEMENTE */}
        <ConfirmModal
          isOpen={showDeleteDialog}
          title="Eliminar Guía Permanentemente"
          message="⚠️ ¿Estás seguro de que deseas eliminar esta guía? Esta acción NO se puede deshacer y la guía se borrará permanentemente de la base de datos. Si solo quieres ocultarla temporalmente, usa el botón 'Desactivar'."
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteDialog(false);
            setGuiaToDelete(null);
          }}
          confirmLabel="Sí, Eliminar Permanentemente"
          variant="destructive"
          isLoading={isDeleting}
        />
      </CardContent>
    </Card>
  );
};
