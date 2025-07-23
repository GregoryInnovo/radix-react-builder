
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Recycle, Users, MapPin, Star, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">NatuvitalDB</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/search">Buscar ROA</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/productos">Productos</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/lotes">Mis Lotes</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Iniciar Sesión</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-green-800 mb-6">
            Plataforma de Intercambio de ROA
          </h2>
          <p className="text-xl text-green-600 mb-8 max-w-3xl mx-auto">
            Conectamos generadores y transformadores de Residuos Orgánicos Aprovechables 
            para crear un ecosistema circular sostenible
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
              <Link to="/auth">Comenzar Ahora</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/search">Explorar ROA</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona NatuvitalDB?
            </h3>
            <p className="text-lg text-gray-600">
              Una plataforma integral para la gestión de residuos orgánicos aprovechables
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Recycle className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Registro de Lotes ROA</CardTitle>
                <CardDescription>
                  Los generadores registran sus lotes de residuos orgánicos con ubicación, 
                  peso y tipo de material
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary">Cáscara de fruta</Badge>
                  <Badge variant="secondary">Posos de café</Badge>
                  <Badge variant="secondary">Restos vegetales</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Intercambio y Órdenes</CardTitle>
                <CardDescription>
                  Los transformadores solicitan lotes y productos, generando órdenes 
                  de intercambio gestionadas por la plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Órdenes pendientes</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completadas</span>
                    <Badge variant="outline">156</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Sistema de Calificaciones</CardTitle>
                <CardDescription>
                  Califica las transacciones y construye reputación en la comunidad 
                  de intercambio de ROA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">5.0 (48 reseñas)</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-green-800 mb-4">
              Impacto de la Comunidad
            </h3>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-green-600 mb-2">2,547</div>
                <div className="text-sm text-gray-600">Lotes ROA registrados</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">1,234</div>
                <div className="text-sm text-gray-600">Productos transformados</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-yellow-600 mb-2">456</div>
                <div className="text-sm text-gray-600">Usuarios activos</div>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">89%</div>
                <div className="text-sm text-gray-600">Satisfacción promedio</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Types of ROA Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tipos de ROA Disponibles
            </h3>
            <p className="text-lg text-gray-600">
              Encuentra el tipo de residuo orgánico que necesitas para tu proceso
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Cáscara de fruta', count: 145, color: 'bg-orange-100 text-orange-800' },
              { name: 'Posos de café', count: 89, color: 'bg-amber-100 text-amber-800' },
              { name: 'Restos vegetales', count: 234, color: 'bg-green-100 text-green-800' },
              { name: 'Cáscara de huevo', count: 67, color: 'bg-yellow-100 text-yellow-800' },
              { name: 'Restos cereales', count: 123, color: 'bg-amber-100 text-amber-800' },
              { name: 'Otros', count: 89, color: 'bg-gray-100 text-gray-800' },
            ].map((type, index) => (
              <Card key={index} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="text-2xl mb-2">🌿</div>
                  <div className="font-semibold text-sm mb-2">{type.name}</div>
                  <Badge className={type.count > 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {type.count} lotes
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para formar parte de la economía circular?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra comunidad de generadores y transformadores de ROA
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/auth">Registrarse como Generador</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-green-600" asChild>
              <Link to="/auth">Registrarse como Transformador</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-lg font-semibold">NatuvitalDB</span>
              </div>
              <p className="text-gray-400">
                Conectando la comunidad de ROA para un futuro más sostenible
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/search" className="hover:text-white">Buscar ROA</Link></li>
                <li><Link to="/productos" className="hover:text-white">Productos</Link></li>
                <li><Link to="/lotes" className="hover:text-white">Lotes</Link></li>
                <li><Link to="/ordenes" className="hover:text-white">Órdenes</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Guías ROA</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidad</a></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NatuvitalDB. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
