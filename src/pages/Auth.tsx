
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { ExpiredLinkNotice } from '@/components/auth/ExpiredLinkNotice';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { parseAuthParams } from '@/lib/authUtils';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const authParams = parseAuthParams();
  
  const modeParam = searchParams.get('mode') || authParams.get('mode');
  const typeParam = searchParams.get('type') || authParams.get('type');
  const error = searchParams.get('error') || authParams.get('error');
  const errorDescription = searchParams.get('error_description') || authParams.get('error_description');
  const email = searchParams.get('email') || authParams.get('email');
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(
    modeParam === 'register' ? 'register' : 'login'
  );
  const { isAuthenticated, isEmailVerified, loading } = useAuth();
  const navigate = useNavigate();

  // Detectar tipo de error de verificación
  const getErrorType = (): 'expired' | 'invalid' | 'already_verified' | null => {
    if (!error && !errorDescription) return null;
    
    const errorMsg = errorDescription?.toLowerCase() || error?.toLowerCase() || '';
    
    if (errorMsg.includes('expired') || errorMsg.includes('expirado')) {
      return 'expired';
    }
    if (errorMsg.includes('invalid') || errorMsg.includes('inválido')) {
      return 'invalid';
    }
    if (errorMsg.includes('already') || errorMsg.includes('verificado')) {
      return 'already_verified';
    }
    
    // Supabase error codes
    if (error === 'access_denied' || errorMsg.includes('link') || errorMsg.includes('token')) {
      return 'expired';
    }
    
    return null;
  };

  const errorType = getErrorType();

  useEffect(() => {
    // Evitar redirección durante el flujo de recuperación de contraseña
    if (!loading && isAuthenticated && isEmailVerified && typeParam !== 'recovery') {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isEmailVerified, loading, navigate, typeParam]);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleForgotPassword = () => {
    setMode('forgot-password');
  };

  const handleBackToLogin = () => {
    setMode('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si hay error de verificación, mostrar componente específico
  if (errorType) {
    return <ExpiredLinkNotice initialEmail={email || ''} errorType={errorType} />;
  }

  // Si es recuperación de contraseña (viene del email)
  if (typeParam === 'recovery') {
    return <ResetPasswordForm />;
  }

  // Si el usuario pidió recuperar contraseña
  if (mode === 'forgot-password') {
    return <ForgotPasswordForm onBack={handleBackToLogin} />;
  }

  return (
    <AuthForm 
      mode={mode} 
      onToggleMode={toggleMode} 
      onForgotPassword={handleForgotPassword}
    />
  );
};

export default Auth;
