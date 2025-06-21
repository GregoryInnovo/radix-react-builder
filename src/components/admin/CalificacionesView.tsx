
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { StarRating } from '@/components/calificaciones/StarRating';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, Star, Calendar, AlertTriangle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Calificacion = Database['public']['Tables']['calificaciones']['Row'];

interface CalificacionesViewProps {
  calificaciones: Calificacion[];
}

export const CalificacionesView: React.FC<CalificacionesViewProps> = ({ calificaciones }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCalificaciones = calificaciones.filter(calificacion => 
    calificacion.comentario?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar en comentarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                {calificacion.reportada && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Reportada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Calificador ID: </span>
                    <span className="font-mono text-xs">{calificacion.calificador_id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Calificado ID: </span>
                    <span className="font-mono text-xs">{calificacion.calificado_id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Orden ID: </span>
                    <span className="font-mono text-xs">{calificacion.orden_id}</span>
                  </div>
                  {calificacion.producto_id && (
                    <div>
                      <span className="font-medium">Producto ID: </span>
                      <span className="font-mono text-xs">{calificacion.producto_id}</span>
                    </div>
                  )}
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
