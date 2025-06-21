
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const NotificacionesDropdown: React.FC = () => {
  const { notificaciones, unreadCount, markAsRead, markAllAsRead } = useNotificaciones();

  const recentNotifications = notificaciones.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notificaciones.length === 0 ? (
          <DropdownMenuItem disabled>
            No tienes notificaciones
          </DropdownMenuItem>
        ) : (
          <>
            {recentNotifications.map((notificacion) => (
              <DropdownMenuItem
                key={notificacion.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${
                  !notificacion.leida ? 'bg-blue-50' : ''
                }`}
                onClick={() => !notificacion.leida && markAsRead(notificacion.id)}
              >
                <div className="flex w-full items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notificacion.titulo}</div>
                    <div className="text-xs text-gray-600 mt-1">{notificacion.mensaje}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {format(new Date(notificacion.created_at), 'PPp', { locale: es })}
                    </div>
                  </div>
                  {!notificacion.leida && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notificacion.id);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            
            {notificaciones.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-gray-500">
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
