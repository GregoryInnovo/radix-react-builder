
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Shield, Heart, Users, CheckCircle } from 'lucide-react';

export const TrustSection: React.FC = () => {
  const trustFeatures = [
    {
      title: "Sistema de Calificaciones",
      description: "Cada intercambio es evaluado con estrellas y comentarios para construir reputación",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Verificación de Usuarios", 
      description: "Proceso de validación que garantiza usuarios reales y comprometidos",
      icon: Shield,
      color: "text-blue-600", 
      bgColor: "bg-blue-50"
    },
    {
      title: "Compromiso Ambiental",
      description: "Todos los usuarios se comprometen con prácticas sostenibles y responsables",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Comunidad Activa",
      description: "Red de usuarios que se apoyan mutuamente en el cuidado del medio ambiente",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const ratingExamples = [
    { stars: 5, user: "María G.", comment: "Excelente calidad de los residuos, muy bien clasificados", type: "Generador" },
    { stars: 5, user: "Carlos T.", comment: "Productos increíbles, transformación perfecta del compost", type: "Transformador" },
    { stars: 4, user: "Ana L.", comment: "Muy buena experiencia, entrega puntual y producto como se describía", type: "Consumidor" }
  ];

  const renderStars = (count: number) => {
    return Array.from({length: 5}).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < count ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Confianza y Reputación
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Construimos una comunidad basada en la confianza mutua, el respeto ambiental y la transparencia en cada intercambio.
          </p>
        </div>

        {/* Trust Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {trustFeatures.map((feature, index) => (
            <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rating System Explanation */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="border-yellow-200 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-yellow-800">
                <Star className="w-6 h-6 text-yellow-600" />
                Sistema de Estrellas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">¿Cómo funciona?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Cada usuario puede calificar de 1 a 5 estrellas
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Se evalúa calidad, puntualidad y comunicación
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Los comentarios son públicos y verificados
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      La reputación se construye con el tiempo
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                <Heart className="w-6 h-6 text-green-600" />
                Valores de la Comunidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 mb-2">Nuestros compromisos:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Respeto por el medio ambiente
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Transparencia en todos los intercambios
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Apoyo mutuo entre usuarios
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Responsabilidad social y ambiental
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rating Examples */}
        <Card className="border-gray-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center">Ejemplos de Calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {ratingExamples.map((example, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-lg bg-white/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{example.user}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {example.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {renderStars(example.stars)}
                  </div>
                  <p className="text-sm text-gray-600 italic">
                    "{example.comment}"
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trust Badge */}
        <div className="text-center mt-12">
          <div className="inline-block p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
            <Shield className="w-8 h-8 mx-auto mb-2" />
            <h3 className="font-bold text-lg mb-1">Plataforma Verificada</h3>
            <p className="text-green-100">Todos los intercambios son seguros y auditados</p>
          </div>
        </div>
      </div>
    </section>
  );
};
