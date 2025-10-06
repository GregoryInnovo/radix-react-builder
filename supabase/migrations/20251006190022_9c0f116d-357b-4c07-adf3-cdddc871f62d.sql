-- Add admin_notes column to lotes table to store rejection/approval messages
ALTER TABLE public.lotes 
ADD COLUMN IF NOT EXISTS admin_notes text;