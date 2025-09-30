import React from 'react';
import { Bell, Package, ShoppingCart, MessageSquare, Check, MapPin, Star, AlertTriangle, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificaciones } from '@/hooks/useNotificaciones';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificacionesDropdown: React.FC = () => {
  const { notificaciones, unreadCount, markAsRead, markAllAsRead } = useNotificaciones();
  const navigate = useNavigate();
  const [showAll, setShowAll] = React.useState(false);

  const getNotificationIcon = (tipo: string, entityType?: string) => {
    switch (tipo) {
      case 'producto':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'orden':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'lote':
        return <MapPin className="h-4 w-4 text-orange-500" />;
      case 'mensaje':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'calificacion':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleNotificationClick = async (notificacion: any) => {
    await markAsRead(notificacion.id);
    
    if (notificacion.redirect_url) {
      navigate(notificacion.redirect_url);
    }
  };

  const displayedNotifications = showAll ? notificaciones : notificaciones.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-500">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`w-80 ${showAll ? 'max-h-[500px]' : 'max-h-96'} overflow-y-auto bg-white z-50`} align="end">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
          <span className="font-semibold">Notificaciones</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-6 px-2 text-xs hover:bg-gray-100"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Marcar todas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notificaciones.length === 0 ? (
          <DropdownMenuItem disabled className="text-center py-8 text-gray-500">
            No tienes notificaciones
          </DropdownMenuItem>
        ) : (
          <>
            {displayedNotifications.map((notificacion) => (
              <DropdownMenuItem 
                key={notificacion.id}
                className={`flex items-start space-x-3 p-3 cursor-pointer hover:bg-gray-50 border-none ${!notificacion.leida ? 'bg-blue-50 border-l-4 border-blue-400' : ''}`}
                onClick={() => handleNotificationClick(notificacion)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notificacion.tipo, notificacion.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium truncate ${!notificacion.leida ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notificacion.titulo}
                    </p>
                    {!notificacion.leida && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {notificacion.mensaje}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(notificacion.created_at), { 
                        addSuffix: true, 
                        locale: es 
                      })}
                    </p>
                    {notificacion.entity_type && (
                      <Badge variant="outline" className="text-xs">
                        {notificacion.entity_type}
                      </Badge>
                    )}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            
            {notificaciones.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center text-sm text-gray-500 cursor-pointer hover:bg-gray-50" 
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowAll(!showAll);
                  }}
                >
                  {showAll ? 'Ver menos notificaciones' : 'Ver todas las notificaciones'}
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};