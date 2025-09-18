import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuiaCard } from './GuiaCard';
import { useGuias } from '@/hooks/useGuias';
import { BookOpen, ArrowRight } from 'lucide-react';
export const GuiasPreviewSection = () => {
  const {
    guias,
    isLoading
  } = useGuias({
    destacadas: true
  });

  const previewGuias = guias.slice(0, 4);

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Guías ROA Destacadas
            </h3>
            <p className="text-lg text-gray-600">
              Aprende mejores prácticas para el manejo de residuos orgánicos
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-3xl font-bold text-gray-900">
              Guías ROA Destacadas
            </h3>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Aprende mejores prácticas para el manejo de residuos orgánicos
          </p>
          <Button variant="outline" asChild>
            <Link to="/guias" className="inline-flex items-center">
              Ver todas las guías
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {previewGuias.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {previewGuias.map((guia) => (
              <GuiaCard key={guia.id} guia={guia} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};