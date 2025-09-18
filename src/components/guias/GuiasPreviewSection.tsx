import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GuiaCard } from './GuiaCard';
import { useGuias } from '@/hooks/useGuias';
import { BookOpen, ArrowRight } from 'lucide-react';

export const GuiasPreviewSection = () => {
  const { guias, isLoading } = useGuias({ destacadas: true });
  const previewGuias = guias.slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Guías para una Vida <span className="text-primary">Sostenible</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre consejos prácticos, tutoriales paso a paso y recursos educativos 
            para reducir tu impacto ambiental y adoptar un estilo de vida más consciente.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Guías Disponibles</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary mb-1">5</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary mb-1">15k+</div>
              <div className="text-sm text-muted-foreground">Vistas Totales</div>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="p-0">
              <div className="text-2xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Guides */}
        {previewGuias.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-6 text-center">Guías Destacadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {previewGuias.map((guia) => (
                <GuiaCard key={guia.id} guia={guia} />
              ))}
            </div>
          </div>
        )}


        {/* Call to Action */}
        <div className="text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/guias">
              Explorar Todas las Guías
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};