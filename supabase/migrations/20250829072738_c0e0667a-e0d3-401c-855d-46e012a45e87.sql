-- Allow multiple active exchange requests per user/product by removing the unique constraint/index
-- We don't change RLS or app logic; only drop the DB-level uniqueness

-- 1) Drop as table constraint if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'ordenes_activas_unicas'
      AND t.relname = 'ordenes'
      AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.ordenes DROP CONSTRAINT ordenes_activas_unicas;
  END IF;
END $$;

-- 2) Drop as unique index if it exists (covers the case it was created as a partial unique index)
DROP INDEX IF EXISTS public.ordenes_activas_unicas;