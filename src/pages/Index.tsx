
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Recycle, Users, TrendingUp, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const WelcomeScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
            <Leaf className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bienvenido a <span className="text-green-600">NatuVital</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La plataforma que conecta generadores y transformadores de residuos orgánicos aprovechables 
            para crear un futuro más sostenible.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Recycle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Intercambia ROA</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Conecta con otros usuarios para intercambiar residuos orgánicos aprovechables 
                y crear productos de valor.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Comunidad Activa</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Únete a una comunidad comprometida con la sostenibilidad y el aprovechamiento 
                de recursos orgánicos.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Impacto Positivo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Contribuye a reducir el desperdicio y crear una economía circular 
                más sostenible para todos.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3">
              Comenzar Ahora
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Hola, {user?.user_metadata?.full_name || user?.email}!
          </h1>
          <p className="text-gray-600">
            Bienvenido a tu panel de NatuVital. Desde aquí podrás gestionar tus intercambios de ROA.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Mis Lotes
              </CardTitle>
              <CardDescription>
                Gestiona tus lotes de residuos orgánicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/lotes">
                <Button variant="outline" className="w-full">
                  Ver Mis Lotes
                </Button>
              </Link>
              <Link to="/lotes">
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Lote
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-emerald-800">Buscar ROA</CardTitle>
              <CardDescription>
                Encuentra residuos cerca de tu ubicación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explorar
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-green-800">Mis Intercambios</CardTitle>
              <CardDescription>
                Historial de intercambios realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Ver Historial
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const Index = () => {
  const { isAuthenticated, isEmailVerified } = useAuth();

  if (isAuthenticated && isEmailVerified) {
    return (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    );
  }

  return <WelcomeScreen />;
};

export default Index;
