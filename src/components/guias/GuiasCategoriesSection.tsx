import { Card, CardContent } from '@/components/ui/card';
import { Link, useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

export const GuiasCategoriesSection = () => {
  const [searchParams] = useSearchParams();
  const activeCategoria = searchParams.get('categoria');

  const categorias = [
    { 
      name: '¿Sabías que...?', 
      slug: 'sabias_que',
      icon: '🧠', 
      description: 'Crea conciencia sobre el valor de los residuos y su impacto ambiental positivo.'
    },
    { 
      name: 'Reutilización y aprovechamiento', 
      slug: 'reutilizacion_aprovechamiento',
      icon: '♻️', 
      description: 'Enseña formas simples y prácticas de transformar residuos en nuevos recursos.'
    },
    { 
      name: 'Manuales técnicos / operativos', 
      slug: 'manuales_tecnicos',
      icon: '🧾', 
      description: 'Explica paso a paso cómo gestionar lotes, órdenes y productos según el rol del usuario.'
    },
    { 
      name: 'Salud y bienestar natural', 
      slug: 'salud_bienestar',
      icon: '🌿', 
      description: 'Promueve hábitos saludables y consumo responsable con enfoque sostenible.'
    },
    { 
      name: 'Impacto y sostenibilidad local', 
      slug: 'impacto_sostenibilidad',
      icon: '🌎', 
      description: 'Muestra resultados, historias y métricas del impacto real de la red Natuvital.'
    },
  ];

  return (
    <section className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Explorar por Categorías</h3>
        <p className="text-muted-foreground">
          Encuentra guías específicas según tus intereses
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categorias.map((categoria) => {
          const isActive = activeCategoria === categoria.slug;
          
          return (
            <Link 
              key={categoria.slug}
              to={`/guias?categoria=${categoria.slug}`}
              className="group"
            >
              <Card className={`text-center hover:shadow-md transition-all duration-200 cursor-pointer relative ${
                isActive 
                  ? 'border-2 border-primary bg-primary/5 scale-105 shadow-lg' 
                  : 'hover:scale-105'
              }`}>
                <CardContent className="p-6">
                  {isActive && (
                    <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                      <Check className="h-3 w-3 mr-1" />
                      Activo
                    </Badge>
                  )}
                  <div className="text-4xl mb-3">{categoria.icon}</div>
                  <h4 className={`font-semibold mb-2 transition-colors ${
                    isActive ? 'text-primary' : 'group-hover:text-primary'
                  }`}>
                    {categoria.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {categoria.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};