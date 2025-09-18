import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useOrdenes } from '@/hooks/useOrdenes';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

const formSchema = z.object({
  cantidad_solicitada: z.number().min(1, "La cantidad debe ser mayor a 0"),
  fecha_propuesta_retiro: z.date().optional(),
  hora_propuesta_retiro: z.string().optional(),
  mensaje_solicitud: z.string().optional(),
  modalidad_entrega: z.string().optional(),
  telefono_contacto: z.string()
    .min(1, "El teléfono de contacto es requerido")
    .regex(/^[\d\s\-\(\)\+]+$/, "El teléfono solo debe contener números y símbolos válidos (+, -, (, ), espacios)"),
  direccion_contacto: z.string().optional(),
}).refine((data) => {
  // Make direccion_contacto required only when modalidad_entrega is "domicilio"
  if (data.modalidad_entrega === 'domicilio') {
    return data.direccion_contacto && data.direccion_contacto.trim().length > 0;
  }
  return true;
}, {
  message: "La dirección de contacto es requerida cuando la modalidad de entrega es 'Domicilio'",
  path: ["direccion_contacto"],
}).refine((data) => {
  if (data.fecha_propuesta_retiro && data.hora_propuesta_retiro) {
    const selectedDate = data.fecha_propuesta_retiro;
    const selectedTime = data.hora_propuesta_retiro;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    
    // If it's today, validate that time is at least 1 hour from now
    if (selectedDateOnly.getTime() === today.getTime()) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes);
      
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      return selectedDateTime >= oneHourFromNow;
    }
  }
  return true;
}, {
  message: "Para el día de hoy, la hora debe ser al menos 1 hora posterior a la actual",
  path: ["hora_propuesta_retiro"],
});

interface OrdenFormProps {
  tipo_item: 'lote' | 'producto';
  item_id: string;
  proveedor_id: string;
  producto?: Producto | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const OrdenForm: React.FC<OrdenFormProps> = ({
  tipo_item,
  item_id,
  proveedor_id,
  producto,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const { createOrden } = useOrdenes();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cantidad_solicitada: 1,
      mensaje_solicitud: "",
      modalidad_entrega: "",
      telefono_contacto: "",
      direccion_contacto: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    const ordenData = {
      tipo_item: tipo_item,
      item_id,
      proveedor_id,
      cantidad_solicitada: values.cantidad_solicitada,
      fecha_propuesta_retiro: values.fecha_propuesta_retiro?.toISOString().split('T')[0],
      hora_propuesta_retiro: values.hora_propuesta_retiro,
      modalidad_entrega: values.modalidad_entrega || null,
      mensaje_solicitud: values.mensaje_solicitud || null,
      telefono_contacto: values.telefono_contacto,
      direccion_contacto: values.direccion_contacto,
    };

    const result = await createOrden(ordenData);

    if (result.requiresConfirmation) {
      setConfirmationData({
        existingOrdersCount: result.existingOrdersCount!,
        ordenData,
      });
      setShowConfirmation(true);
    } else if (result.data) {
      onSuccess?.();
    }
    
    setIsSubmitting(false);
  };

  const handleConfirmOrder = async () => {
    if (!confirmationData) return;
    
    setIsSubmitting(true);
    const result = await createOrden(confirmationData.ordenData, true);
    
    if (result.data) {
      setShowConfirmation(false);
      onSuccess?.();
    }
    
    setIsSubmitting(false);
  };

  // Only show delivery options for products with delivery
  const showDeliveryOptions = tipo_item === 'producto' && producto?.incluye_domicilio;
  const currentModalidad = form.watch("modalidad_entrega");

  return (
    <div className="h-[80vh]">
      <ScrollArea className="h-full pr-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cantidad_solicitada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad Solicitada *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showDeliveryOptions && (
          <FormField
            control={form.control}
            name="modalidad_entrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modalidad de Entrega</FormLabel>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "text-sm font-medium",
                      field.value === 'punto' ? "text-primary" : "text-muted-foreground"
                    )}>
                      En punto
                    </span>
                    <FormControl>
                      <Switch
                        checked={field.value === 'domicilio'}
                        onCheckedChange={(checked) => 
                          field.onChange(checked ? 'domicilio' : 'punto')
                        }
                      />
                    </FormControl>
                    <span className={cn(
                      "text-sm font-medium",
                      field.value === 'domicilio' ? "text-primary" : "text-muted-foreground"
                    )}>
                      Domicilio
                    </span>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="telefono_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono de Contacto *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ej: +57 300 123 4567" 
                  {...field}
                  onChange={(e) => {
                    // Only allow numbers, spaces, hyphens, parentheses, and + sign
                    const value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
                    field.onChange(value);
                  }}
                />
              </FormControl>
              <FormDescription>
                Solo se permiten números y símbolos válidos (+, -, (, ), espacios)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion_contacto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Dirección de Contacto {currentModalidad === 'domicilio' ? '*' : '(Opcional)'}
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={
                    currentModalidad === 'domicilio' 
                      ? "Dirección completa para la entrega a domicilio (requerida)" 
                      : "Dirección de referencia (opcional)"
                  }
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                {currentModalidad === 'domicilio' 
                  ? "Requerida para entregas a domicilio"
                  : "Solo se requiere si la modalidad de entrega es 'Domicilio'"
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fecha_propuesta_retiro"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha Propuesta de Retiro</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                    className="rounded-md border pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hora_propuesta_retiro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hora Propuesta de Retiro</FormLabel>
              <FormControl>
                <Input
                  type="time"
                  {...field}
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                Para el día de hoy, debe ser al menos 1 hora posterior a la hora actual
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mensaje_solicitud"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe tu solicitud o incluye información adicional..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </ScrollArea>

      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Nueva Solicitud</AlertDialogTitle>
            <AlertDialogDescription>
              Ya has realizado {confirmationData?.existingOrdersCount} solicitud{confirmationData?.existingOrdersCount > 1 ? 'es' : ''} de intercambio para este {tipo_item === 'producto' ? 'producto' : 'lote'}. ¿Deseas continuar y crear una nueva solicitud?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmOrder} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Sí, continuar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};