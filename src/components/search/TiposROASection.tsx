import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTiposResiduo } from '@/hooks/useTiposResiduo';
import { Link } from 'react-router-dom';

export const TiposROASection = () => {
  const { tiposResiduos, loading } = useTiposResiduo();

  if (loading) {
    return (
      <section className="mb-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Tipos de ROA Disponibles
          </h3>
          <p className="text-gray-600">
            Encuentra el tipo de residuo orgánico que necesitas para tu proceso
          </p>
        </div>
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Tipos de ROA Disponibles
        </h3>
        <p className="text-gray-600">
          Encuentra el tipo de residuo orgánico que necesitas para tu proceso
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
        {tiposResiduos.map((tipo) => (
          <Link
            key={tipo.id}
            to={`/search?tipo=${tipo.id}`}
            className="group"
          >
            <Card className="text-center hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer">
              <CardContent className="pt-6">
                <div className="text-2xl mb-2">🌿</div>
                <div className="font-semibold text-sm mb-2 group-hover:text-blue-600 transition-colors">
                  {tipo.nombre}
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Disponible
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};