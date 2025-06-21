
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Play, Leaf } from 'lucide-react';

export const ROAGuideSection: React.FC = () => {
  const correctItems = [
    "Cáscaras de frutas y verduras",
    "Restos de café y té",
    "Hojas y ramas pequeñas",
    "Restos de comida sin condimentar",
    "Papel y cartón sin químicos"
  ];

  const incorrectItems = [
    "Carnes y huesos",
    "Productos lácteos",
    "Aceites y grasas",
    "Comida condimentada o con sal",
    "Papel plastificado o con tinta"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ¿Qué es ROA y cómo se dispone correctamente?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Los Residuos Orgánicos Aprovechables (ROA) son materiales biodegradables que pueden transformarse en productos útiles como compost, biofertilizantes o alimento para animales.
          </p>
        </div>

        {/* Definition Card */}
        <Card className="mb-12 border-green-200 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-800">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              Definición de ROA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed">
              Son todos aquellos residuos biodegradables de origen vegetal o animal que pueden ser transformados 
              mediante procesos biológicos en productos con valor agregado, contribuyendo a la economía circular 
              y reduciendo el impacto ambiental.
            </p>
          </CardContent>
        </Card>

        {/* What to include vs not include */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Correct items */}
          <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-green-800">
                <CheckCircle className="w-6 h-6 text-green-600" />
                ✅ Lo que SÍ incluir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {correctItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Incorrect items */}
          <Card className="border-red-200 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-red-800">
                <XCircle className="w-6 h-6 text-red-600" />
                ❌ Lo que NO incluir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {incorrectItems.map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Video Section */}
        <Card className="border-green-200 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Video Guía: Clasificación de ROA
              </h3>
              <p className="text-gray-600 mb-6">
                Aprende paso a paso cómo clasificar correctamente tus residuos orgánicos
              </p>
              
              {/* Mock Video Player */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden max-w-2xl mx-auto">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                  >
                    <Play className="w-8 h-8 mr-2" />
                    Reproducir Video (2:30)
                  </Button>
                </div>
                
                {/* Video Controls Mock */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
                  <div className="text-sm">
                    📹 Incluye subtítulos y audio explicativo
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Duración: 2:30 min
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Con subtítulos
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Audio explicativo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
