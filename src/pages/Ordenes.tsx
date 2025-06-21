
import React from 'react';
import { Header } from '@/components/layout/Header';
import { OrdenesList } from '@/components/ordenes/OrdenesList';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Ordenes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Acceso Requerido</h2>
              <p className="text-gray-600 mb-4">
                Para ver tus órdenes de intercambio, necesitas iniciar sesión.
              </p>
              <Button asChild>
                <Link to="/auth">Iniciar Sesión</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestión de Órdenes
            </h1>
            <p className="text-gray-600">
              Administra tus solicitudes de intercambio y responde a las que has recibido.
            </p>
          </div>
          
          <OrdenesList />
        </div>
      </div>
    </div>
  );
};

export default Ordenes;
