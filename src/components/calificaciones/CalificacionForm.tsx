
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { useCalificaciones } from '@/hooks/useCalificaciones';

interface CalificacionFormProps {
  ordenId: string;
  calificadoId: string;
  productoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CalificacionForm: React.FC<CalificacionFormProps> = ({
  ordenId,
  calificadoId,
  productoId,
  onSuccess,
  onCancel
}) => {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const { createCalificacion } = useCalificaciones();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (puntuacion === 0) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await createCalificacion({
        orden_id: ordenId,
        calificado_id: calificadoId,
        producto_id: productoId || null,
        puntuacion,
        comentario: comentario.trim() || null
      });

      if (!error && onSuccess) {
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Calificación (obligatorio)
        </label>
        <StarRating
          rating={puntuacion}
          interactive
          onRatingChange={setPuntuacion}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comentario" className="block text-sm font-medium mb-2">
          Comentario (opcional)
        </label>
        <Textarea
          id="comentario"
          placeholder="Comparte tu experiencia..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          type="submit"
          disabled={puntuacion === 0 || loading}
          className="flex-1"
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
