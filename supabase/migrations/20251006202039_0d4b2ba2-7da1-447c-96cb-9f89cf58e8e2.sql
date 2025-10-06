-- Add RLS policy to allow users to delete their own notifications
CREATE POLICY "Users can delete their own notifications"
ON notificaciones
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);