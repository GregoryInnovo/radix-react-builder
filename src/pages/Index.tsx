import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Leaf, Recycle, Users, MapPin, Star, TrendingUp, User } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { UserProfileLink } from '@/components/user/UserProfileLink';
import { GuiasPreviewSection } from '@/components/guias/GuiasPreviewSection';
const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isAuthenticated,
    user
  } = useAuth();
  const { getProfileById } = useProfiles();
  const [userProfile, setUserProfile] = React.useState<any>(null);

  // Redirect to /auth if there are error parameters in URL
  React.useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error || errorDescription) {
      // Preserve all error parameters when redirecting
      const errorParams = new URLSearchParams();
      searchParams.forEach((value, key) => {
        errorParams.set(key, value);
      });
      navigate(`/auth?${errorParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Get user profile for displaying first name
  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      getProfileById(user.id).then(profile => {
        setUserProfile(profile);
      });
    }
  }, [isAuthenticated, user?.id, getProfileById]);

  // Helper function to get first word of full name
  const getFirstName = (fullName: string): string => {
    if (!fullName) return 'Usuario';
    return fullName.trim().split(' ')[0];
  };
  return <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">NatuVital</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/guias">Guías</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/ordenes">Órdenes</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/productos">Productos</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/lotes">Lotes</Link>
              </Button>
              {isAuthenticated ? (
                <UserProfileLink 
                  userId={user?.id || ''} 
                  userName={userProfile ? getFirstName(userProfile.full_name) : getFirstName(user?.email?.split('@')[0] || '')}
                  className="flex items-center space-x-1"
                  showIcon={true}
                  size="sm"
                />
              ) : (
                <Button asChild>
                  <Link to="/auth">Iniciar Sesión</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-inherit">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 font-extrabold text-6xl text-green-600">¡Hola!</h2>
          <p className="mb-8 max-w-3xl mx-auto text-2xl text-green-800">Conectamos generadores y transformadores de Residuos Orgánicos Aprovechables (R.O.A), creando un ecosistema circular sostenible</p>
          <div className="flex flex-wrap justify-center gap-4">
            {!isAuthenticated ? <>
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link to="/auth">Comenzar Ahora</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/lotes">Explorar R.O.A</Link>
                </Button>
              </> : <>
                <Button size="lg" className="bg-green-600 hover:bg-green-700" asChild>
                  <Link to="/lotes">Mis Lotes</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/lotes">Buscar R.O.A</Link>
                </Button>
              </>}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Cómo funciona Natuvital?
            </h3>
            <p className="text-lg text-gray-600 mx-[2px] my-[4px] px-[2px] py-[4px]">Una plataforma integral para la gestión de Residuos Orgánicos, su intercambio y aprovechamiento para crear productos y alternativas naturales.
Hay usuarios generadores de estos residuos, quienes los transforman y quienes consumen sus productos derivados,así como otras variedades pensadas para la salud y bienestar de las personas.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-green-50">
              <CardHeader className="bg-green-50">
                <Recycle className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Registro de Lotes R.O.A</CardTitle>
                <CardDescription>
                  Los generadores registran sus lotes de residuos orgánicos con ubicación, 
                  peso y tipo de material
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="secondary" className="bg-green-400">Cáscara de fruta</Badge>
                  <Badge variant="secondary" className="bg-green-400">Semillas</Badge>
                  <Badge variant="secondary" className="bg-green-400">Restos vegetales</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="bg-green-50">
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
                    <span className="text-sm text-inherit">Órdenes pendientes</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completadas</span>
                    <Badge variant="outline">156</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50">
              <CardHeader className="bg-green-50">
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Sistema de Calificaciones</CardTitle>
                <CardDescription>Califica los intercambios y construye buena reputación en la comunidad natural, tu opinión es vital</CardDescription>
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
      


      {/* Guides Section */}
      <GuiasPreviewSection />

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            ¿Listo para formar parte de la economía circular?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a nuestra comunidad de generadores y transformadores de R.O.A
          </p>
          {!isAuthenticated ? <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                
              </Button>
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-white border-green-500" asChild>
                <Link to="/auth">¡Registrarse ahora!</Link>
              </Button>
            </div> : <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/lotes">Gestionar Lotes</Link>
              </Button>
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-white border-green-500" asChild>
                <Link to="/productos">Ver Productos</Link>
              </Button>
            </div>}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6 text-green-400" />
                <span className="text-lg font-semibold">Natuvital</span>
              </div>
              <p className="text-gray-400">Conectando la comunidad de R.O.A para un futuro más sostenible y saludable.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/lotes" className="hover:text-white">Buscar R.O.A</Link></li>
                <li><Link to="/productos" className="hover:text-white">Productos</Link></li>
                <li><Link to="/lotes" className="hover:text-white">Lotes</Link></li>
                <li><Link to="/ordenes" className="hover:text-white">Órdenes</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white">Guías R.O.A</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terminos" className="hover:text-white">Términos de Uso</Link></li>
                <li><Link to="/tratamiento-datos" className="hover:text-white">Tratamiento de Datos Personales</Link></li>
                <li><a href="#" className="hover:text-white">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 Natuvital. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;