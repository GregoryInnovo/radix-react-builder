import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

// Validación mejorada de email
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

export const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateEmail(email);
    if (!validation.valid) {
      setEmailError(validation.error);
      return;
    }
    
    const result = await resetPassword(email);
    
    if (!result.error) {
      setEmailSent(true);
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
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {emailSent ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-sm text-green-800 font-medium mb-2">
                  Email enviado correctamente
                </p>
                <p className="text-xs text-green-700">
                  Si existe la cuenta, hemos enviado un enlace de recuperación a <strong>{email}</strong>
                </p>
                <p className="text-xs text-green-600 mt-3 bg-green-100 p-2 rounded">
                  💡 <strong>Tip:</strong> Revisa tu carpeta de spam si no encuentras el email
                </p>
              </div>

              <Button
                onClick={onBack}
                variant="outline"
                className="w-full border-green-200 hover:bg-green-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                {emailError && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {emailError}
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
                      setEmailError('');
                    }}
                    placeholder="tu@email.com"
                    className={cn(
                      "pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500",
                      emailError && "border-red-500"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>

                <Button
                  type="button"
                  onClick={onBack}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
