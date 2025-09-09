
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/calificaciones/StarRating';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Star, Calendar, AlertTriangle, Eye, EyeOff, Trash2, CheckCircle, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'] & {
  calificador?: { full_name: string };
  calificado?: { full_name: string };
  orden?: { tipo_item: string };
};

interface CalificacionesViewProps {
  calificaciones: Calificacion[];
}

export const CalificacionesView: React.FC<CalificacionesViewProps> = ({ calificaciones: initialCalificaciones }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'todas' | 'reportadas' | 'ocultas'>('todas');
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>(initialCalificaciones);
  const [loading, setLoading] = useState(false);
  
  const { 
    hideCalificacion, 
    unhideCalificacion, 
    dismissReport, 
    deleteCalificacion,
    getReportedCalificaciones 
  } = useCalificaciones();
  const { toast } = useToast();

  useEffect(() => {
    setCalificaciones(initialCalificaciones);
  }, [initialCalificaciones]);

  const loadReportedCalificaciones = async () => {
    setLoading(true);
    try {
      const reported = await getReportedCalificaciones();
      setCalificaciones(reported as any);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las calificaciones reportadas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHideCalificacion = async (id: string) => {
    try {
      await hideCalificacion(id);
      toast({
        title: "Comentario ocultado",
        description: "El comentario ha sido ocultado exitosamente"
      });
      // Refresh data
      await loadReportedCalificaciones();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo ocultar el comentario",
        variant: "destructive"
      });
    }
  };

  const handleUnhideCalificacion = async (id: string) => {
    try {
      await unhideCalificacion(id);
      toast({
        title: "Comentario mostrado",
        description: "El comentario vuelve a ser visible"
      });
      await loadReportedCalificaciones();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo mostrar el comentario",
        variant: "destructive"
      });
    }
  };

  const handleDismissReport = async (id: string) => {
    try {
      await dismissReport(id);
      toast({
        title: "Reporte descartado",
        description: "El reporte ha sido descartado"
      });
      await loadReportedCalificaciones();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo descartar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCalificacion = async (id: string) => {
    if (!confirm('¿Estás seguro? Esta acción eliminará permanentemente la calificación y afectará el promedio del usuario.')) {
      return;
    }

    try {
      await deleteCalificacion(id);
      toast({
        title: "Calificación eliminada",
        description: "La calificación ha sido eliminada permanentemente"
      });
      await loadReportedCalificaciones();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la calificación",
        variant: "destructive"
      });
    }
  };

  const filteredCalificaciones = calificaciones.filter(calificacion => {
    const matchesSearch = calificacion.comentario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calificacion.calificador?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calificacion.calificado?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'todas' || 
                         (filter === 'reportadas' && calificacion.reportada) ||
                         (filter === 'ocultas' && calificacion.oculta);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en comentarios, usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filter} onValueChange={(value: 'todas' | 'reportadas' | 'ocultas') => setFilter(value)}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las calificaciones</SelectItem>
            <SelectItem value="reportadas">Solo reportadas</SelectItem>
            <SelectItem value="ocultas">Solo ocultas</SelectItem>
          </SelectContent>
        </Select>
        {filter === 'reportadas' && (
          <Button onClick={loadReportedCalificaciones} variant="outline" disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar'}
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {filteredCalificaciones.map((calificacion) => (
          <Card key={calificacion.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Calificación 
                      <StarRating rating={calificacion.puntuacion} interactive={false} size="sm" />
                      <span className="text-sm font-normal">
                        ({calificacion.puntuacion}/5)
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(calificacion.created_at), 'PP', { locale: es })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {calificacion.reportada && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Reportada
                    </Badge>
                  )}
                  {calificacion.oculta && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      Oculta
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Calificador: </span>
                    <span className="text-gray-600">{calificacion.calificador?.full_name || 'Usuario desconocido'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Calificado: </span>
                    <span className="text-gray-600">{calificacion.calificado?.full_name || 'Usuario desconocido'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tipo de orden: </span>
                    <span className="text-gray-600">{calificacion.orden?.tipo_item || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="font-medium">ID: </span>
                    <span className="font-mono text-xs text-gray-500">{calificacion.id}</span>
                  </div>
                </div>

                {/* Acciones administrativas */}
                <div className="flex gap-2 pt-4 border-t">
                  {calificacion.reportada && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissReport(calificacion.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Descartar reporte
                    </Button>
                  )}
                  
                  {calificacion.oculta ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnhideCalificacion(calificacion.id)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Mostrar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleHideCalificacion(calificacion.id)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      <EyeOff className="h-4 w-4 mr-1" />
                      Ocultar
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCalificacion(calificacion.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar permanentemente
                  </Button>
                </div>

                {calificacion.comentario && (
                  <div>
                    <span className="font-medium">Comentario: </span>
                    <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                      {calificacion.comentario}
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
