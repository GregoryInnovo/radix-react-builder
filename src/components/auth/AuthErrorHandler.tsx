import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';
import { parseAuthParams, clearAuthParams } from '@/lib/authUtils';

export const AuthErrorHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const authParams = parseAuthParams();
    const error = authParams.get('error');
    const errorDescription = authParams.get('error_description');
    const typeParam = authParams.get('type');

    if (error || errorDescription) {
      const description = errorDescription?.toLowerCase() || '';
      
      // Detectar errores relacionados con enlaces expirados/inválidos
      if (
        description.includes('email link is invalid') ||
        description.includes('expired') ||
        description.includes('token') ||
        error === 'access_denied'
      ) {
        // Distinguir entre enlace de verificación vs recuperación de contraseña
        const isRecovery = typeParam === 'recovery';
        
        setErrorMessage({
          title: isRecovery ? 'Enlace de recuperación expirado' : 'Enlace de verificación expirado',
          description: isRecovery 
            ? 'Tu enlace de recuperación de contraseña ha expirado o es inválido. Los enlaces son válidos por 24 horas por seguridad. Por favor, solicita un nuevo enlace de recuperación.'
            : 'Tu enlace de verificación ha expirado o es inválido. Los enlaces son válidos por 24 horas por seguridad. Por favor, regístrate nuevamente o solicita un nuevo enlace.'
        });
        setShowErrorDialog(true);
      }
    }
  }, [location]);

  const handleRegisterAgain = () => {
    setShowErrorDialog(false);
    clearAuthParams();
    navigate('/auth?mode=register');
  };

  const handleGoToLogin = () => {
    setShowErrorDialog(false);
    const authParams = parseAuthParams();
    const isRecovery = authParams.get('type') === 'recovery';
    clearAuthParams();
    
    // Si es recuperación, redirigir a forgot-password
    navigate(isRecovery ? '/auth?mode=forgot-password' : '/auth');
  };

  const authParams = parseAuthParams();
  const isRecovery = authParams.get('type') === 'recovery';

  return (
    <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>{errorMessage.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {errorMessage.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleGoToLogin}>
            {isRecovery ? 'Solicitar nuevo enlace' : 'Ir a inicio de sesión'}
          </AlertDialogCancel>
          {!isRecovery && (
            <AlertDialogAction onClick={handleRegisterAgain}>
              Registrarse nuevamente
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
