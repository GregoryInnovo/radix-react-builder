-- Add contact information and time fields to ordenes table
ALTER TABLE public.ordenes 
ADD COLUMN telefono_contacto text,
ADD COLUMN direccion_contacto text,
ADD COLUMN hora_propuesta_retiro time;