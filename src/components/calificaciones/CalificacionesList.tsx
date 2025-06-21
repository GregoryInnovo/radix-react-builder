
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from './StarRating';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, MessageSquare } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'];

interface CalificacionesListProps {
  calificaciones: Calificacion[];
  showDeleteButton?: boolean;
}

export const CalificacionesList: React.FC<CalificacionesListProps> = ({
  calificaciones,
  showDeleteButton = false
}) => {
  const { deleteCalificacion } = useCalificaciones();
  const { user } = useAuth();

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta calificación?')) {
      await deleteCalificacion(id);
    }
  };

  if (calificaciones.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay calificaciones disponibles aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {calificaciones.map((calificacion) => (
        <Card key={calificacion.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <StarRating rating={calificacion.puntuacion} />
                <div className="text-sm text-gray-500 mt-1">
                  {format(new Date(calificacion.created_at), 'PPp', { locale: es })}
                </div>
              </div>
              {showDeleteButton && user?.id === calificacion.calificador_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(calificacion.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          {calificacion.comentario && (
            <CardContent>
              <p className="text-gray-700">{calificacion.comentario}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
