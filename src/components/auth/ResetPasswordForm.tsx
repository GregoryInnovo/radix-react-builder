import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [ready, setReady] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { updatePassword, loading, session, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setFormError('');
    if (session) {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [session]);

  const validatePasswords = () => {
    const newErrors = {
      newPassword: '',
      confirmPassword: ''
    };
    
    let isValid = true;
    
    if (!newPassword.trim()) {
      newErrors.newPassword = 'La contraseña es obligatoria';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Debes confirmar la contraseña';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ready) {
      setFormError('Enlace inválido o expirado. Abre de nuevo el enlace de recuperación desde tu email.');
      return;
    }
    
    if (!validatePasswords()) {
      return;
    }
    
    const result = await updatePassword(newPassword);
    
    if (!result.error) {
      // Cerrar sesión temporal y redirigir al login
      await signOut();
      navigate('/auth?mode=login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Ingresa tu nueva contraseña. Debe ser diferente a la anterior.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!ready && (
            <div className="text-sm text-blue-800 bg-blue-50 p-2 rounded border border-blue-200">
              Validando enlace de recuperación…
            </div>
          )}
          {formError && (
            <div className="text-sm text-red-700 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                Nueva contraseña
              </Label>
              {errors.newPassword && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.newPassword}
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  placeholder="Ingresa tu nueva contraseña"
                  className={cn(
                    "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                    errors.newPassword && "border-red-500"
                  )}
                />
              </div>
              {!errors.newPassword && (
                <p className="text-xs text-gray-500">
                  Mínimo 6 caracteres. Debe ser diferente a la anterior.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Repite la nueva contraseña
              </Label>
              {errors.confirmPassword && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.confirmPassword}
                </div>
              )}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="Repite tu nueva contraseña"
                  className={cn(
                    "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                    errors.confirmPassword && "border-red-500"
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !ready}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5"
            >
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> La nueva contraseña debe ser diferente a tu contraseña anterior. Supabase valida esto automáticamente por seguridad.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
