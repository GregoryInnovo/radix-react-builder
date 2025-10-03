
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode');
  const [mode, setMode] = useState<'login' | 'register'>(
    modeParam === 'register' ? 'register' : 'login'
  );
  const { isAuthenticated, isEmailVerified, loading } = useAuth();
  const navigate = useNavigate();

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

  return <AuthForm mode={mode} onToggleMode={toggleMode} />;
};

export default Auth;
