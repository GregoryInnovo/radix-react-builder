import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag, AlertTriangle } from 'lucide-react';
import { useCalificaciones } from '@/hooks/useCalificaciones';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ReportarCalificacionProps {
  calificacionId: string;
  calificadorId: string;
  calificadoId: string;
}

const motivosReporte = [
  { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
  { value: 'spam', label: 'Spam o contenido irrelevante' },
  { value: 'informacion_falsa', label: 'Información falsa' },
  { value: 'acoso', label: 'Acoso o intimidación' },
  { value: 'otro', label: 'Otro motivo' }
];

export const ReportarCalificacion: React.FC<ReportarCalificacionProps> = ({
  calificacionId,
  calificadorId,
  calificadoId
}) => {
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { reportarCalificacion } = useCalificaciones();
  const { user } = useAuth();
  const { toast } = useToast();

  // No mostrar el botón si el usuario no está autenticado o es el autor/calificado
  if (!user || user.id === calificadorId || user.id === calificadoId) {
    return null;
  }

  const handleSubmit = async () => {
    if (!motivo) {
      toast({
        title: "Error",
        description: "Por favor selecciona un motivo para el reporte",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const motivoCompleto = motivo === 'otro' && descripcion 
        ? `${motivosReporte.find(m => m.value === motivo)?.label}: ${descripcion}`
        : motivosReporte.find(m => m.value === motivo)?.label || motivo;

      await reportarCalificacion(calificacionId, motivoCompleto);
      
      toast({
        title: "Reporte enviado",
        description: "Hemos recibido tu reporte. Los administradores lo revisarán pronto."
      });
      
      setOpen(false);
      setMotivo('');
      setDescripcion('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el reporte. Inténtalo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-red-600 h-8 px-2"
        >
          <Flag className="h-3 w-3 mr-1" />
          Reportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Reportar Comentario
          </DialogTitle>
          <DialogDescription>
            ¿Por qué quieres reportar este comentario? Los administradores revisarán tu reporte.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="motivo">Motivo del reporte</Label>
            <RadioGroup value={motivo} onValueChange={setMotivo} className="mt-2">
              {motivosReporte.map((motivoOption) => (
                <div key={motivoOption.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={motivoOption.value} id={motivoOption.value} />
                  <Label htmlFor={motivoOption.value} className="text-sm">
                    {motivoOption.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {motivo === 'otro' && (
            <div>
              <Label htmlFor="descripcion">Descripción adicional</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe el motivo de tu reporte..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !motivo}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};