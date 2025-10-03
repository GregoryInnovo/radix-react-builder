
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Función para normalizar user_type a valores válidos de BD
const normalizeUserType = (userType: string): string => {
  const userTypeLower = userType.toLowerCase();
  
  // Mapeo de variantes a valores válidos
  const typeMapping: { [key: string]: string } = {
    'consumer': 'citizen',
    'consumidor': 'citizen',
    'generador': 'generator',
    'transformador': 'transformer',
    'ciudadano': 'citizen'
  };
  
  // Si hay un mapeo específico, usarlo
  if (typeMapping[userTypeLower]) {
    return typeMapping[userTypeLower];
  }
  
  // Si ya es un valor válido, mantenerlo
  const validTypes = ['generator', 'transformer', 'citizen', 'admin'];
  if (validTypes.includes(userTypeLower)) {
    return userTypeLower;
  }
  
  // Por defecto, usar 'generator'
  console.warn(`UserType no reconocido: ${userType}, usando 'generator' por defecto`);
  return 'generator';
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, userType: string) => {
    setLoading(true);
    try {
      // Check if user is suspended before allowing signup
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('is_active')
        .eq('email', email)
        .single();

      if (existingProfile && existingProfile.is_active === false) {
        toast({
          title: "Usuario suspendido",
          description: "Este usuario ha sido suspendido y no puede registrarse.",
          variant: "destructive",
        });
        return { data: null, error: { message: "User suspended" } };
      }

      const redirectUrl = `${window.location.origin}/auth`;
      console.log('Iniciando registro para:', email, 'con redirect:', redirectUrl);
      
      // Normalizar userType para que coincida con la restricción de BD
      const normalizedUserType = normalizeUserType(userType);
      console.log('UserType normalizado:', userType, '->', normalizedUserType);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            user_type: normalizedUserType
          }
        }
      });

      console.log('Resultado del registro:', { data, error });

      if (error) {
        // Manejar casos específicos de error
        if (error.message.includes('User already registered')) {
          toast({
            title: "Usuario ya registrado",
            description: "Este email ya está registrado. ¿Deseas reenviar el email de verificación?",
            variant: "destructive",
          });
          return { data: null, error: { ...error, code: 'user_already_exists' } };
        }
        throw error;
      }

      // Si no hay error pero tampoco hay usuario, significa que el usuario ya existe
      if (!data.user && !error) {
        console.log('Usuario ya existe, sin error específico');
        toast({
          title: "Email ya registrado",
          description: "Este email ya está en uso. Revisa tu bandeja de entrada o reenvía el email de verificación.",
        });
        return { data: null, error: { message: 'User already exists', code: 'user_already_exists' } };
      }

      toast({
        title: "¡Registro exitoso!",
        description: `Hemos enviado un email de verificación a ${email}. Revisa tu bandeja de entrada y spam.`,
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Mensajes de error más específicos
      let errorMessage = "Ocurrió un error inesperado";
      if (error.message.includes('Email rate limit exceeded')) {
        errorMessage = "Se han enviado demasiados emails. Espera unos minutos antes de intentar de nuevo.";
      } else if (error.message.includes('Invalid email')) {
        errorMessage = "El formato del email no es válido.";
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = "La contraseña debe tener al menos 6 caracteres.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error en el registro",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        toast({
          title: "Email no verificado",
          description: "Debes verificar tu email antes de acceder. Revisa tu bandeja de entrada.",
          variant: "destructive",
        });
        return { data: null, error: { message: "Email not verified" } };
      }

      // Check if user is suspended
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profile && profile.is_active === false) {
          await supabase.auth.signOut();
          toast({
            title: "Cuenta suspendida",
            description: "Este usuario ha sido suspendido. Contacta al administrador.",
            variant: "destructive",
          });
          return { data: null, error: { message: "User suspended" } };
        }
      }

      toast({
        title: "¡Bienvenido a NatuVital!",
        description: "Has iniciado sesión correctamente.",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Error al iniciar sesión",
        description: error.message || "Credenciales incorrectas",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resendConfirmation = async (email: string) => {
    setLoading(true);
    try {
      console.log('Reenviando confirmación para:', email);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      console.log('Resultado del reenvío:', { error });

      if (error) {
        if (error.message.includes('Email rate limit exceeded')) {
          toast({
            title: "Límite de emails alcanzado",
            description: "Espera unos minutos antes de solicitar otro email de verificación.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Email reenviado exitosamente",
        description: `Hemos enviado otro email de verificación a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`,
      });
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Error al reenviar",
        description: error.message || "No se pudo reenviar el email de verificación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation,
    isAuthenticated: !!user,
    isEmailVerified: !!user?.email_confirmed_at
  };
};
