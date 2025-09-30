-- Add 'no_disponible' to batch_status enum
ALTER TYPE batch_status ADD VALUE IF NOT EXISTS 'no_disponible';