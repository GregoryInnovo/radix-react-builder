
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, Search, Star, Shield, ArrowRight } from 'lucide-react';

export const UserGuidesSection: React.FC = () => {
  const userTypes = [
    {
      title: "U1 - Generador",
      description: "Usuarios que crean y publican lotes de residuos orgánicos",
      icon: Package,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
      steps: [
        "Crear un lote con descripción y fotos",
        "Establecer ubicación y disponibilidad", 
        "Cambiar estados del lote (disponible, reservado, entregado)",
        "Recibir y gestionar órdenes de transformadores",
        "Calificar a los transformadores tras la entrega"
      ]
    },
    {
      title: "U2 - Transformador", 
      description: "Usuarios que procesan residuos y crean productos",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50", 
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-200",
      steps: [
        "Buscar lotes disponibles por ubicación y tipo",
        "Solicitar lotes que se ajusten a sus necesidades",
        "Recoger residuos y procesar en productos",
        "Publicar productos terminados en la plataforma",
        "Calificar generadores y recibir calificaciones"
      ]
    },
    {
      title: "U3 - Consumidor",
      description: "Usuarios que adquieren productos transformados",
      icon: Search,
      color: "from-teal-500 to-cyan-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600", 
      borderColor: "border-teal-200",
      steps: [
        "Navegar productos disponibles por categoría",
        "Filtrar por ubicación, precio y calificaciones",
        "Solicitar intercambio o compra de productos",
        "Coordinar entrega con el transformador",
        "Valorar productos y experiencia de compra"
      ]
    },
    {
      title: "U4 - Administrador",
      description: "Gestores de la plataforma y moderadores",
      icon: Shield,
      color: "from-purple-500 to-indigo-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200", 
      steps: [
        "Acceder al panel de control administrativo",
        "Supervisar usuarios, lotes y productos",
        "Moderar contenido y resolver disputas",
        "Gestionar calificaciones y auditorías",
        "Monitorear métricas y estadísticas de la plataforma"
      ]
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Guías por tipo de usuario
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cada rol tiene funciones específicas en la plataforma. Descubre cómo participar según tu perfil.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {userTypes.map((userType, index) => (
            <Card key={index} className={`${userType.borderColor} hover:shadow-xl transition-all duration-300 group`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${userType.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <userType.icon className={`w-6 h-6 ${userType.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {userType.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-normal">
                      {userType.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h4 className="font-semibold text-gray-900 mb-4">Funciones principales:</h4>
                <ul className="space-y-3">
                  {userType.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${userType.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className="text-white text-xs font-bold">{stepIndex + 1}</span>
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ul>

                {/* Call to action */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Aprende más sobre este rol
                    </span>
                    <ArrowRight className={`w-4 h-4 ${userType.iconColor} group-hover:translate-x-1 transition-transform`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <Card className="inline-block border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <p className="text-blue-800 font-medium">
                💡 Un usuario puede tener múltiples roles en la plataforma según sus actividades
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
