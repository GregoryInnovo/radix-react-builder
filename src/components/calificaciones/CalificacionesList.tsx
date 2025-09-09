import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { ReportarCalificacion } from './ReportarCalificacion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'] & {
  calificador?: {
    full_name: string;
    avatar_url?: string;
  };
};

interface CalificacionesListProps {
  calificaciones: Calificacion[];
  showDeleteButton?: boolean;
  defaultLimit?: number;
  showExpandButton?: boolean;
}

export const CalificacionesList: React.FC<CalificacionesListProps> = ({ 
  calificaciones, 
  showDeleteButton = false,
  defaultLimit,
  showExpandButton = false
}) => {
  const [showAll, setShowAll] = useState(false);
  const { deleteCalificacion } = useCalificaciones();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta calificación?')) {
      const result = await deleteCalificacion(id);
      if (!result.error) {
        // Refresh data here or handle via parent component
      }
    }
  };

  // Filtrar solo calificaciones con comentarios
  const calificacionesConComentarios = calificaciones.filter(cal => cal.comentario && cal.comentario.trim() !== '');
  
  if (calificacionesConComentarios.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Aún no hay comentarios disponibles.
      </p>
    );
  }

  // Determinar cuántas mostrar
  const shouldLimit = defaultLimit && !showAll;
  const displayedCalificaciones = shouldLimit 
    ? calificacionesConComentarios.slice(0, defaultLimit)
    : calificacionesConComentarios;

  const hasMore = defaultLimit && calificacionesConComentarios.length > defaultLimit;

  return (
    <div className="space-y-4">
      {displayedCalificaciones.map((calificacion) => (
        <Card key={calificacion.id}>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={calificacion.calificador?.avatar_url} />
                  <AvatarFallback>
                    {calificacion.calificador?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {calificacion.calificador?.full_name || 'Usuario'}
                  </p>
                  <div className="flex items-center gap-2">
                    <StarRating rating={calificacion.puntuacion} interactive={false} size="sm" />
                    <span className="text-xs text-gray-500">
                      {format(new Date(calificacion.created_at), 'PP', { locale: es })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ReportarCalificacion
                  calificacionId={calificacion.id}
                  calificadorId={calificacion.calificador_id}
                  calificadoId={calificacion.calificado_id}
                />
                {showDeleteButton && user?.id === calificacion.calificador_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(calificacion.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-gray-700 text-sm leading-relaxed">
              {calificacion.comentario}
            </p>
          </CardContent>
        </Card>
      ))}
      
      {hasMore && showExpandButton && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full sm:w-auto"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver más comentarios ({calificacionesConComentarios.length - defaultLimit!} más)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};