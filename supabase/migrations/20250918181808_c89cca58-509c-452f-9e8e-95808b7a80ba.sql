-- Fix existing notifications with incorrect redirect URLs
UPDATE notificaciones 
SET redirect_url = CONCAT('/perfil/', 
  CASE 
    WHEN metadata->>'rater_name' IS NOT NULL THEN user_id::text
    ELSE user_id::text
  END
)
WHERE tipo = 'calificacion' 
AND redirect_url = '/profile';