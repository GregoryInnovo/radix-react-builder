
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useOrdenes } from '@/hooks/useOrdenes';
import type { Database } from '@/integrations/supabase/types';

type Producto = Database['public']['Tables']['productos']['Row'];

const formSchema = z.object({
  cantidad_solicitada: z.number().min(1, 'La cantidad debe ser mayor a 0'),
  fecha_propuesta_retiro: z.date().min(new Date(), 'La fecha debe ser futura'),
  mensaje_solicitud: z.string().optional(),
  modalidad_entrega: z.enum(['domicilio', 'punto']),
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
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { createOrden } = useOrdenes();

  // Check if the product includes delivery (only for products)
  const showDeliveryOptions = tipo_item === 'producto' && producto?.incluye_domicilio;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cantidad_solicitada: 1,
      mensaje_solicitud: '',
      modalidad_entrega: 'punto',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const { error } = await createOrden({
        tipo_item,
        item_id,
        proveedor_id,
        cantidad_solicitada: values.cantidad_solicitada,
        fecha_propuesta_retiro: values.fecha_propuesta_retiro.toISOString().split('T')[0],
        mensaje_solicitud: values.mensaje_solicitud || null,
      });

      if (!error) {
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('fecha_propuesta_retiro', date);
      setCalendarOpen(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="cantidad_solicitada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad Solicitada</FormLabel>
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
          name="fecha_propuesta_retiro"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha Propuesta de Retiro</FormLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                      onClick={() => setCalendarOpen(true)}
                      type="button"
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
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
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

        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
