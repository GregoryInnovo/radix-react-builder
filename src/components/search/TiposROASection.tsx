import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTiposResiduoWithCounts } from '@/hooks/useTiposResiduoWithCounts';
import { cn } from '@/lib/utils';

interface TiposROASectionProps {
  selectedType?: string;
  onTypeSelect?: (typeId: string) => void;
}

export const TiposROASection: React.FC<TiposROASectionProps> = ({
  selectedType,
  onTypeSelect
}) => {
  const { tiposResiduos, loading } = useTiposResiduoWithCounts();

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
        {/* All types option */}
        <Card 
          className={cn(
            "text-center hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer",
            !selectedType ? "ring-2 ring-primary bg-primary/5" : ""
          )}
          onClick={() => onTypeSelect?.('all')}
        >
          <CardContent className="pt-6">
            <div className="text-2xl mb-2">🌱</div>
            <div className={cn(
              "font-semibold text-sm mb-2 transition-colors",
              !selectedType ? "text-primary" : "hover:text-blue-600"
            )}>
              Todos los tipos
            </div>
            <div className="space-y-1">
              <Badge className={cn(
                "text-xs",
                !selectedType 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-blue-100 text-blue-800"
              )}>
                Ver todos
              </Badge>
              <Badge variant="outline" className="text-xs block">
                Sin filtros
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Individual residue types - sorted with "Otros" at the end */}
        {tiposResiduos
          .sort((a, b) => {
            // Move "Otros" to the end
            if (a.nombre.toLowerCase().includes('otros')) return 1;
            if (b.nombre.toLowerCase().includes('otros')) return -1;
            return a.nombre.localeCompare(b.nombre);
          })
          .map((tipo) => {
            const isSelected = selectedType === tipo.id;
            return (
              <Card 
                key={tipo.id}
                className={cn(
                  "text-center hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer",
                  isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                )}
                onClick={() => onTypeSelect?.(tipo.id)}
              >
                <CardContent className="pt-6">
                  <div className="text-2xl mb-2">🌿</div>
                  <div className={cn(
                    "font-semibold text-sm mb-2 transition-colors",
                    isSelected ? "text-primary" : "hover:text-blue-600"
                  )}>
                    {tipo.nombre}
                  </div>
                  <div className="space-y-1">
                    <Badge className={cn(
                      "text-xs",
                      isSelected 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-green-100 text-green-800"
                    )}>
                      {tipo.lotes_count} lotes
                    </Badge>
                    <Badge variant="outline" className="text-xs block">
                      Disponible
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </section>
  );
};