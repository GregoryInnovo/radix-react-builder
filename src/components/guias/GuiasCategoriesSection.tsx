import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const GuiasCategoriesSection = () => {
  const categorias = [
    { name: 'Compostaje', icon: '🌱', count: '12 guías' },
    { name: 'Reciclaje', icon: '♻️', count: '15 guías' },
    { name: 'Reducción', icon: '📉', count: '8 guías' },
    { name: 'Reutilización', icon: '🔄', count: '10 guías' },
    { name: 'Sostenibilidad', icon: '🌍', count: '14 guías' },
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
        {categorias.map((categoria) => (
          <Link 
            key={categoria.name}
            to={`/guias?categoria=${categoria.name.toLowerCase()}`}
            className="group"
          >
            <Card className="text-center hover:shadow-md transition-all duration-200 hover:scale-105">
              <CardContent className="p-4">
                <div className="text-3xl mb-2">{categoria.icon}</div>
                <h4 className="font-medium mb-1 group-hover:text-primary transition-colors">
                  {categoria.name}
                </h4>
                <p className="text-xs text-muted-foreground">{categoria.count}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};