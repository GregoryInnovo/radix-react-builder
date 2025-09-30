import React from 'react';
import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface OrdenTimelineProps {
  orden: {
    created_at: string;
    updated_at: string;
    estado: string;
  };
}

export const OrdenTimeline: React.FC<OrdenTimelineProps> = ({ orden }) => {
  const createdDate = new Date(orden.created_at);
  const updatedDate = new Date(orden.updated_at);
  const duration = differenceInHours(updatedDate, createdDate);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completada':
        return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'aceptada':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'aceptada':
        return 'Aceptada';
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div className="w-px h-8 bg-border my-1" />
          {getStatusIcon(orden.estado)}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium">Orden Creada</p>
            <p className="text-xs text-muted-foreground">
              {format(createdDate, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdDate, { addSuffix: true, locale: es })}
            </p>
          </div>
          
          <div>
            <p className="text-sm font-medium">{getStatusLabel(orden.estado)}</p>
            <p className="text-xs text-muted-foreground">
              {format(updatedDate, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(updatedDate, { addSuffix: true, locale: es })}
            </p>
          </div>
        </div>
      </div>
      
      {(orden.estado === 'completada' || orden.estado === 'cancelada') && duration > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Duración del proceso:</span>{' '}
            {duration < 24 
              ? `${duration} ${duration === 1 ? 'hora' : 'horas'}`
              : `${Math.floor(duration / 24)} ${Math.floor(duration / 24) === 1 ? 'día' : 'días'}`
            }
          </p>
        </div>
      )}
    </div>
  );
};
