
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { ExpiredLinkNotice } from '@/components/auth/ExpiredLinkNotice';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const email = searchParams.get('email');
  
  const [mode, setMode] = useState<'login' | 'register'>(
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
    if (!loading && isAuthenticated && isEmailVerified) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isEmailVerified, loading, navigate]);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
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

  return <AuthForm mode={mode} onToggleMode={toggleMode} />;
};

export default Auth;
