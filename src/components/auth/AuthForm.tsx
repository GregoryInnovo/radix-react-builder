
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Leaf, Mail, Lock, User, Factory, Recycle, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AuthFormProps {
  mode: 'login' | 'register';
  onToggleMode: () => void;
  onForgotPassword?: () => void;
}

export const AuthForm = ({ mode, onToggleMode, onForgotPassword }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    userType: '',
    terms: ''
  });
  
  const { signIn, signUp, resendConfirmation, loading } = useAuth();

  const userTypes = [
    { id: 'generator', label: 'Generador', icon: Recycle, description: 'Genero residuos orgánicos aprovechables' },
    { id: 'transformer', label: 'Transformador', icon: Factory, description: 'Proceso y transformo R.O.A' },
    { id: 'citizen', label: 'Consumidor', icon: Users, description: 'Compro productos transformados' }
  ];

  const validateEmail = (email: string): { valid: boolean; error: string } => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { valid: false, error: 'El correo electrónico es obligatorio' };
    }
    
    if (trimmedEmail.includes(' ')) {
      return { valid: false, error: 'El correo no puede contener espacios' };
    }
    
    // Verificar doble @
    if (trimmedEmail.includes('@@')) {
      return { valid: false, error: 'Correo no válido' };
    }
    
    // Verificar formato básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { valid: false, error: 'Formato de correo incorrecto' };
    }
    
    // Verificar dominio válido
    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
      return { valid: false, error: 'Correo no válido' };
    }
    
    const domain = parts[1];
    if (!domain.includes('.') || domain.endsWith('.') || domain.startsWith('.')) {
      return { valid: false, error: 'El dominio del correo no es válido' };
    }
    
    const domainParts = domain.split('.');
    const extension = domainParts[domainParts.length - 1];
    if (extension.length < 2) {
      return { valid: false, error: 'El dominio del correo no es válido' };
    }
    
    return { valid: true, error: '' };
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      userType: '',
      terms: ''
    };
    
    let isValid = true;
    
    if (mode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'El nombre completo es obligatorio';
        isValid = false;
      }
      
      if (!selectedUserType) {
        newErrors.userType = 'Debes seleccionar un tipo de usuario';
        isValid = false;
      }
      
      if (!acceptedTerms) {
        newErrors.terms = 'Debes aceptar los términos para continuar';
        isValid = false;
      }
    }
    
    // Usar validación mejorada de email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error;
      isValid = false;
    }
    
    if (!password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (mode === 'register') {
      setShowConfirmation(true);
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setLoginError(result.error.message);
      }
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
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {loginError && mode === 'login' && (
                  <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                
                {mode === 'register' && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Nombre completo
                    </Label>
                    {errors.fullName && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.fullName}
                      </div>
                    )}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setErrors(prev => ({ ...prev, fullName: '' }));
                        }}
                        placeholder="Tu nombre completo"
                        className={cn(
                          "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                          errors.fullName && "border-red-500"
                        )}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </Label>
                  {errors.email && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrors(prev => ({ ...prev, email: '' }));
                          setLoginError('');
                        }}
                      placeholder="tu@email.com"
                      className={cn(
                        "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                        errors.email && "border-red-500"
                      )}
                    />
                  </div>
                </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Contraseña
                    </Label>
                    {errors.password && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.password}
                      </div>
                    )}
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors(prev => ({ ...prev, password: '' }));
                          setLoginError('');
                        }}
                        placeholder="Tu contraseña"
                        className={cn(
                          "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                          errors.password && "border-red-500"
                        )}
                      />
                    </div>
                    {mode === 'register' && !errors.password && (
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
                      {errors.userType && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.userType}
                        </div>
                      )}
                      <div className="grid grid-cols-1 gap-2">
                        {userTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                setSelectedUserType(type.id);
                                setErrors(prev => ({ ...prev, userType: '' }));
                              }}
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
                    </div>
                  )}

                  {mode === 'register' && (
                    <div className="space-y-2">
                      {errors.terms && (
                        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.terms}
                        </div>
                      )}
                      <div className={cn(
                        "flex items-start space-x-2 p-3 bg-gray-50 rounded-lg border",
                        errors.terms ? "border-red-500" : "border-gray-200"
                      )}>
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) => {
                            setAcceptedTerms(checked === true);
                            setErrors(prev => ({ ...prev, terms: '' }));
                          }}
                          className="mt-0.5"
                        />
                        <div className="space-y-1 leading-none">
                          <label
                            htmlFor="terms"
                            className="text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Acepto los{' '}
                            <a 
                              href="/terminos" 
                              target="_blank" 
                              className="text-green-600 hover:text-green-700 underline"
                            >
                              Términos y Condiciones
                            </a>
                            {' '}y el{' '}
                            <a 
                              href="/tratamiento-datos" 
                              target="_blank" 
                              className="text-green-600 hover:text-green-700 underline"
                            >
                              Tratamiento de Datos Personales
                            </a>
                          </label>
                          <p className="text-xs text-gray-500">
                            Es obligatorio aceptar para poder registrarte
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <Button
                  type="submit"
                  disabled={loading || (mode === 'register' && (!selectedUserType || !acceptedTerms))}
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

              {mode === 'login' && onForgotPassword && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-green-600 hover:text-green-700 underline transition-colors duration-200"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              )}

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
