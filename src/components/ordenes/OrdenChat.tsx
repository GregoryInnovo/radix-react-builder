import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User } from 'lucide-react';
import { useOrdenMensajes } from '@/hooks/useOrdenMensajes';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrdenChatProps {
  ordenId: string;
  orden: any;
  canSendMessages: boolean;
}

export const OrdenChat: React.FC<OrdenChatProps> = ({ ordenId, orden, canSendMessages }) => {
  const { mensajes, loading, sendMensaje } = useOrdenMensajes(ordenId);
  const { user } = useAuth();
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendMessage = async () => {
    if (!nuevoMensaje.trim() || sending) return;

    setSending(true);
    const result = await sendMensaje(nuevoMensaje);
    if (result.data) {
      setNuevoMensaje('');
    }
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getUserRole = (usuarioId: string) => {
    if (usuarioId === orden.solicitante_id) return 'solicitante';
    if (usuarioId === orden.proveedor_id) return 'proveedor';
    return 'usuario';
  };

  const getUserRoleLabel = (usuarioId: string) => {
    if (usuarioId === orden.solicitante_id) return 'Solicitante';
    if (usuarioId === orden.proveedor_id) return 'Proveedor';
    return 'Usuario';
  };

  const isMyMessage = (usuarioId: string) => usuarioId === user?.id;

  // Combine legacy messages with new messages
  const allMessages = [];
  
  // Add legacy messages first (if they exist)
  if (orden.mensaje_solicitud) {
    allMessages.push({
      id: 'legacy-solicitud',
      usuario_id: orden.solicitante_id,
      mensaje: orden.mensaje_solicitud,
      created_at: orden.created_at,
      isLegacy: true
    });
  }
  
  if (orden.mensaje_respuesta) {
    allMessages.push({
      id: 'legacy-respuesta',
      usuario_id: orden.proveedor_id,
      mensaje: orden.mensaje_respuesta,
      created_at: orden.updated_at,
      isLegacy: true
    });
  }

  // Add new messages
  allMessages.push(...mensajes);

  // Sort all messages by date
  allMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">Cargando conversación...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Conversación
          {!canSendMessages && (
            <Badge variant="secondary" className="text-xs">
              {orden.estado === 'completada' ? 'Orden Completada' : 'Orden Cerrada'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages list */}
        <div className="max-h-96 overflow-y-auto space-y-3">
          {allMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              No hay mensajes aún. ¡Inicia la conversación!
            </div>
          ) : (
            allMessages.map((mensaje) => (
              <div
                key={mensaje.id}
                className={`flex ${isMyMessage(mensaje.usuario_id) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    isMyMessage(mensaje.usuario_id)
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {getUserRoleLabel(mensaje.usuario_id)}
                    </span>
                    {mensaje.isLegacy && (
                      <Badge variant="outline" className="text-xs">
                        Inicial
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{mensaje.mensaje}</p>
                  <div className="text-xs opacity-70 mt-1">
                    {format(new Date(mensaje.created_at), 'PP p', { locale: es })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message input */}
        {canSendMessages && (
          <div className="border-t pt-4 space-y-3">
            <Textarea
              placeholder="Escribe tu mensaje aquí..."
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Presiona Enter para enviar, Shift+Enter para nueva línea
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!nuevoMensaje.trim() || sending}
                size="sm"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white"
              >
                <Send className="h-4 w-4" />
                {sending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </div>
        )}

        {!canSendMessages && (
          <div className="border-t pt-4 text-center text-sm text-gray-500">
            La conversación está cerrada. No se pueden enviar más mensajes.
          </div>
        )}
      </CardContent>
    </Card>
  );
};