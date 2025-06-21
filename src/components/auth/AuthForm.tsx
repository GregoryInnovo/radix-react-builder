
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Leaf, Mail, Lock, User, Chrome } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showResend, setShowResend] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resendConfirmation, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (!fullName.trim()) {
        return;
      }
      const result = await signUp(email, password, fullName);
      if (result.data) {
        setShowResend(true);
      }
    } else {
      await signIn(email, password);
    }
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleResendConfirmation = async () => {
    await resendConfirmation(email);
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
              {mode === 'login' ? 'Bienvenido a' : 'Únete a'} NatuVital
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {mode === 'login' 
                ? 'Inicia sesión para intercambiar ROA de forma sostenible'
                : 'Crea tu cuenta y forma parte del cambio sostenible'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {showResend && mode === 'register' ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <Mail className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium">
                  ¡Registro exitoso!
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Revisa tu email <strong>{email}</strong> para verificar tu cuenta.
                </p>
              </div>
              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                Reenviar email de verificación
              </Button>
              <Button
                onClick={() => setShowResend(false)}
                variant="ghost"
                className="w-full text-green-600 hover:text-green-700"
              >
                Volver al registro
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nombre completo
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Tu nombre completo"
                        className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tu contraseña"
                      className="pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      required
                      minLength={6}
                    />
                  </div>
                  {mode === 'register' && (
                    <p className="text-xs text-gray-500">
                      Mínimo 6 caracteres
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 transition-all duration-200"
                >
                  {loading 
                    ? 'Procesando...' 
                    : mode === 'login' 
                      ? 'Iniciar sesión' 
                      : 'Crear cuenta'
                  }
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">O continúa con</span>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                disabled={loading}
                className="w-full border-gray-200 hover:bg-gray-50 transition-colors duration-200"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Google
              </Button>

              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                  {' '}
                  <button
                    onClick={onToggleMode}
                    className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                  >
                    {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
                  </button>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
