import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Mail, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ExpiredLinkNoticeProps {
  initialEmail?: string;
  errorType: 'expired' | 'invalid' | 'already_verified';
}

export const ExpiredLinkNotice = ({ initialEmail = '', errorType }: ExpiredLinkNoticeProps) => {
  const [email, setEmail] = useState(initialEmail);
  const [emailSent, setEmailSent] = useState(false);
  const { resendConfirmation, loading } = useAuth();

  const handleResend = async () => {
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return;
    }
    
    await resendConfirmation(email);
    setEmailSent(true);
  };

  const getErrorMessage = () => {
    switch (errorType) {
      case 'expired':
        return {
          title: 'El enlace de verificación ha expirado',
          description: 'Los enlaces de verificación son válidos por 24 horas por seguridad.',
          icon: Clock
        };
      case 'invalid':
        return {
          title: 'Enlace de verificación inválido',
          description: 'Este enlace no es válido o ya fue utilizado.',
          icon: AlertTriangle
        };
      case 'already_verified':
        return {
          title: 'Email ya verificado',
          description: 'Tu correo electrónico ya ha sido verificado. Puedes iniciar sesión.',
          icon: Mail
        };
      default:
        return {
          title: 'Error en la verificación',
          description: 'Hubo un problema con el enlace de verificación.',
          icon: AlertTriangle
        };
    }
  };

  const errorInfo = getErrorMessage();
  const ErrorIcon = errorInfo.icon;

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email enviado
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Revisa tu bandeja de entrada
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800 font-medium text-center">
                Hemos enviado un nuevo enlace de verificación a:
              </p>
              <p className="text-sm text-green-900 font-semibold text-center mt-1">
                {email}
              </p>
            </div>
            <div className="text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="font-medium text-yellow-800 mb-1">💡 Consejos:</p>
              <ul className="text-yellow-700 space-y-1 list-disc list-inside">
                <li>Revisa tu carpeta de spam o correo no deseado</li>
                <li>El enlace es válido por 24 horas</li>
                <li>Si no recibes el email en 10 minutos, intenta nuevamente</li>
              </ul>
            </div>
            <Button
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Ir a inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <ErrorIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              {errorInfo.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {errorType !== 'already_verified' ? (
            <>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 text-center">
                  Solicita un nuevo enlace de verificación ingresando tu email
                </p>
              </div>

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
                  />
                </div>
              </div>

              <Button
                onClick={handleResend}
                disabled={loading || !email.trim() || !/\S+@\S+\.\S+/.test(email)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-2.5"
              >
                {loading ? 'Enviando...' : 'Reenviar verificación'}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/auth'}
                  className="text-green-600 hover:text-green-700"
                >
                  Volver al inicio de sesión
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={() => window.location.href = '/auth'}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Ir a inicio de sesión
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
