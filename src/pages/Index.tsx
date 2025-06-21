
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Users, Search, Package } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to lotes page
    if (user) {
      navigate('/lotes');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              <span className="text-green-600">ROA</span> Exchange
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Plataforma para el intercambio de Residuos Orgánicos Aprovechables
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/lotes')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Package className="w-5 h-5 mr-2" />
              Gestionar mis Lotes
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/search')}
              className="border-green-200 hover:bg-green-50"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar ROA
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Reduce Desperdicio</CardTitle>
              <CardDescription>
                Convierte tus residuos orgánicos en recursos valiosos para otros
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-emerald-800">Conecta Comunidades</CardTitle>
              <CardDescription>
                Une generadores y transformadores de residuos en tu área local
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-teal-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-teal-800">Gestión Inteligente</CardTitle>
              <CardDescription>
                Organiza y rastrea tus lotes de ROA de manera eficiente
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block border-dashed border-2 border-green-300">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                ¿Listo para comenzar?
              </h2>
              <p className="text-gray-600 mb-6">
                Únete a la red de intercambio de residuos orgánicos aprovechables
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                Comenzar Ahora
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
