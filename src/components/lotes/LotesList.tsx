
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, MapPin, Calendar, Weight } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { Database } from '@/integrations/supabase/types';

type Lote = Database['public']['Tables']['lotes']['Row'];
type ROAType = Database['public']['Enums']['roa_type'];
type BatchStatus = Database['public']['Enums']['batch_status'];

interface LotesListProps {
  lotes: Lote[];
  loading: boolean;
  onEdit: (lote: Lote) => void;
  onDelete: (id: string) => void;
}

const ROA_TYPE_LABELS: Record<ROAType, string> = {
  'cascara_fruta': 'Cáscara de fruta',
  'posos_cafe': 'Posos de café',
  'restos_vegetales': 'Restos vegetales',
  'cascara_huevo': 'Cáscara de huevo',
  'restos_cereales': 'Restos de cereales',
  'otros': 'Otros',
};

const STATUS_LABELS: Record<BatchStatus, string> = {
  'disponible': 'Disponible',
  'reservado': 'Reservado',
  'recogido': 'Recogido',
  'cancelado': 'Cancelado',
};

const STATUS_COLORS: Record<BatchStatus, string> = {
  'disponible': 'bg-green-100 text-green-800',
  'reservado': 'bg-yellow-100 text-yellow-800',
  'recogido': 'bg-blue-100 text-blue-800',
  'cancelado': 'bg-red-100 text-red-800',
};

export const LotesList = ({ lotes, loading, onEdit, onDelete }: LotesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredLotes = lotes.filter(lote => {
    const matchesSearch = lote.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ROA_TYPE_LABELS[lote.tipo_residuo].toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lote.direccion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || lote.estado === statusFilter;
    const matchesType = typeFilter === 'all' || lote.tipo_residuo === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando lotes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Buscar lotes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="disponible">Disponible</SelectItem>
            <SelectItem value="reservado">Reservado</SelectItem>
            <SelectItem value="recogido">Recogido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(ROA_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lotes Grid */}
      {filteredLotes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <Weight className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {lotes.length === 0 ? 'No tienes lotes registrados' : 'No se encontraron lotes'}
              </h3>
              <p className="text-gray-500">
                {lotes.length === 0 
                  ? 'Crea tu primer lote de ROA para comenzar'
                  : 'Prueba con diferentes filtros de búsqueda'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLotes.map((lote) => (
            <Card key={lote.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-green-800">
                      {ROA_TYPE_LABELS[lote.tipo_residuo]}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Weight className="w-4 h-4" />
                      {lote.peso_estimado} kg
                    </CardDescription>
                  </div>
                  <Badge className={STATUS_COLORS[lote.estado]}>
                    {STATUS_LABELS[lote.estado]}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {lote.direccion && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{lote.direccion}</span>
                  </div>
                )}
                
                {lote.fecha_disponible && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Disponible desde: {new Date(lote.fecha_disponible).toLocaleDateString()}</span>
                  </div>
                )}

                {lote.descripcion && (
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {lote.descripcion}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(lote)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar lote?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. El lote será eliminado permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(lote.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
