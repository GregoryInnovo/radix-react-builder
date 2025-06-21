
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Package, Star, ArrowRight } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Genera y Publica",
      description: "Los generadores publican lotes de residuos orgánicos aprovechables en la plataforma",
      icon: Package,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      number: "02", 
      title: "Transforma",
      description: "Los transformadores toman estos residuos y los convierten en productos naturales útiles",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    {
      number: "03",
      title: "Intercambia",
      description: "Los consumidores reciben o intercambian productos directamente desde la app",
      icon: Star,
      color: "from-teal-500 to-cyan-600", 
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Cómo funciona la app?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Un proceso simple en 3 pasos que conecta generadores, transformadores y consumidores
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <Card className="h-full border-2 hover:shadow-xl transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  {/* Step Number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-xl mb-6`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <div className="inline-block p-4 bg-green-50 rounded-lg">
            <p className="text-green-800 font-medium">
              💡 Todo el proceso es monitoreado y auditado para garantizar la calidad y trazabilidad
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
