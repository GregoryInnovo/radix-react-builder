-- Renombrar admin_id a user_id en auditoria_admin para reflejar que cualquier usuario puede generar acciones auditadas
ALTER TABLE auditoria_admin 
RENAME COLUMN admin_id TO user_id;

-- Agregar comentario para clarificar el uso
COMMENT ON COLUMN auditoria_admin.user_id IS 
'ID del usuario que realizó la acción (puede ser admin o usuario regular)';

-- Crear política RLS para que usuarios autenticados puedan insertar registros de auditoría
CREATE POLICY "Users can insert audit logs for their actions"
ON auditoria_admin
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);