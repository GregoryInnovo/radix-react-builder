
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Leaf, Mail, Lock, User, Chrome, Factory, Recycle, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
}

export const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [showResend, setShowResend] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resendConfirmation, loading } = useAuth();

  const userTypes = [
    { id: 'generator', label: 'Generador', icon: Recycle, description: 'Genero residuos orgánicos aprovechables' },
    { id: 'transformer', label: 'Transformador', icon: Factory, description: 'Proceso y transformo R.O.A' },
    { id: 'citizen', label: 'Consumidor', icon: Users, description: 'Compro productos transformados' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (!fullName.trim()) {
        return;
      }
      if (!selectedUserType) {
        return;
      }
      setShowConfirmation(true);
    } else {
      await signIn(email, password);
    }
  };

  const handleConfirmRegistration = async () => {
    const result = await signUp(email, password, fullName, selectedUserType);
    
    // Si el registro fue exitoso o el usuario ya existe, mostrar el panel de reenvío
    if (result.data || (result.error?.code === 'user_already_exists')) {
      setShowResend(true);
      setShowConfirmation(false);
    } else {
      setShowConfirmation(false);
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
                  ? 'Inicia sesión para intercambiar R.O.A de forma sostenible'
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
                  Email de verificación enviado
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Revisa tu email <strong>{email}</strong> para verificar tu cuenta.
                </p>
                <p className="text-xs text-green-600 mt-2 bg-green-100 p-2 rounded">
                  💡 <strong>Tip:</strong> Si no encuentras el email, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
              
              <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <p className="font-medium text-yellow-800 mb-1">⚠️ Problema con los emails?</p>
                <p className="text-yellow-700">
                  El sistema de emails puede tener demoras. Si después de 10 minutos no recibes el email, 
                  prueba reenviar la verificación o contacta al administrador.
                </p>
              </div>

              <Button
                onClick={handleResendConfirmation}
                variant="outline"
                disabled={loading}
                className="w-full border-green-200 hover:bg-green-50"
              >
                {loading ? 'Reenviando...' : 'Reenviar email de verificación'}
              </Button>
              
              <Button
                onClick={() => {
                  setShowResend(false);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                  setSelectedUserType('');
                }}
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

                  {mode === 'register' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700">
                        Tipo de usuario
                      </Label>
                      <div className="grid grid-cols-1 gap-2">
                        {userTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setSelectedUserType(type.id)}
                              className={cn(
                                "p-3 border rounded-lg text-left transition-all duration-200 hover:border-green-300",
                                selectedUserType === type.id
                                  ? "border-green-500 bg-green-50 text-green-900"
                                  : "border-gray-200 hover:bg-gray-50"
                              )}
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className={cn(
                                  "w-5 h-5",
                                  selectedUserType === type.id ? "text-green-600" : "text-gray-400"
                                )} />
                                <div>
                                  <div className={cn(
                                    "font-medium text-sm",
                                    selectedUserType === type.id ? "text-green-900" : "text-gray-900"
                                  )}>
                                    {type.label}
                                  </div>
                                  <div className={cn(
                                    "text-xs",
                                    selectedUserType === type.id ? "text-green-700" : "text-gray-500"
                                  )}>
                                    {type.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {mode === 'register' && !selectedUserType && (
                        <p className="text-xs text-red-500">
                          Selecciona un tipo de usuario
                        </p>
                      )}
                    </div>
                  )}

                <Button
                  type="submit"
                  disabled={loading || (mode === 'register' && !selectedUserType)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-50"
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

      <ConfirmModal
        isOpen={showConfirmation}
        title="Confirmar registro"
        message={`¿Desea crear cuenta como ${userTypes.find(t => t.id === selectedUserType)?.label}?`}
        onConfirm={handleConfirmRegistration}
        onCancel={() => setShowConfirmation(false)}
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        isLoading={loading}
      />
    </div>
  );
};
