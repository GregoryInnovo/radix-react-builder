import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export const AuthErrorHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: ''
  });

  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const typeParam = searchParams.get('type');

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
  }, [searchParams]);

  const handleRegisterAgain = () => {
    setShowErrorDialog(false);
    // Limpiar parámetros de error antes de navegar
    searchParams.delete('error');
    searchParams.delete('error_description');
    searchParams.delete('error_code');
    searchParams.delete('type');
    setSearchParams(searchParams);
    navigate('/auth?mode=register');
  };

  const handleGoToLogin = () => {
    setShowErrorDialog(false);
    // Limpiar parámetros de error antes de navegar
    const isRecovery = searchParams.get('type') === 'recovery';
    searchParams.delete('error');
    searchParams.delete('error_description');
    searchParams.delete('error_code');
    searchParams.delete('type');
    setSearchParams(searchParams);
    
    // Si es recuperación, redirigir a forgot-password
    navigate(isRecovery ? '/auth?mode=forgot-password' : '/auth');
  };

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
            {searchParams.get('type') === 'recovery' ? 'Solicitar nuevo enlace' : 'Ir a inicio de sesión'}
          </AlertDialogCancel>
          {searchParams.get('type') !== 'recovery' && (
            <AlertDialogAction onClick={handleRegisterAgain}>
              Registrarse nuevamente
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
