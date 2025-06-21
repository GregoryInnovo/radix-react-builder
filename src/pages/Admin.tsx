
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAdmin } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';

const Admin = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Admin page effect:', {
      authLoading,
      adminLoading,
      isAuthenticated,
      isAdmin
    });

    // Only redirect if both auth and admin checks are complete
    if (!authLoading && !adminLoading) {
      if (!isAuthenticated) {
        console.log('User not authenticated, redirecting to home');
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, adminLoading, navigate]);

  // Show loading while either auth or admin status is being determined
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="ml-4 text-gray-600">
              {authLoading ? 'Verificando autenticación...' : 'Verificando permisos de administrador...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, this will be handled by the useEffect redirect
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
              <p className="text-gray-600">
                Debes iniciar sesión para acceder al panel administrativo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated but not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Acceso Denegado</h2>
              <p className="text-gray-600">
                No tienes permisos para acceder al panel administrativo.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is authenticated and is admin - show the dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel Administrativo
          </h1>
          <p className="text-gray-600">
            Gestiona usuarios, lotes, productos y supervisa la actividad de la plataforma.
          </p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
