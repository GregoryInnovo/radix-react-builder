import { Card, CardContent } from '@/components/ui/card';

interface GuiasCategoriesSectionProps {
  selectedCategoria?: string;
  onSelectCategoria: (slug: string) => void;
}

export const GuiasCategoriesSection = ({ selectedCategoria, onSelectCategoria }: GuiasCategoriesSectionProps) => {

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
          const isActive = selectedCategoria === categoria.slug;
          
          return (
            <Card 
              key={categoria.slug}
              onClick={() => onSelectCategoria(categoria.slug)}
              className={`text-center hover:shadow-md transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:scale-105'
              }`}
            >
              <CardContent className="p-6">
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
          );
        })}
      </div>
    </section>
  );
};