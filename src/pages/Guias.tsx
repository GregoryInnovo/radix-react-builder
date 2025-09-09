import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GuiasFilters } from '@/components/guias/GuiasFilters';
import { GuiasGrid } from '@/components/guias/GuiasGrid';
import { Button } from '@/components/ui/button';
import { useGuias, GuiaCategoria, GuiaType, GuiaNivel } from '@/hooks/useGuias';
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guias() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAdmin();
  
  // Get initial values from URL params
  const [filters, setFilters] = useState({
    categoria: searchParams.get('categoria') as GuiaCategoria | undefined,
    tipo: searchParams.get('tipo') as GuiaType | undefined,
    nivel: searchParams.get('nivel') as GuiaNivel | undefined,
    search: searchParams.get('search') || '',
  });

  const { guias, isLoading, hasNextPage, loadNextPage } = useGuias(filters);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.categoria) newParams.set('categoria', filters.categoria);
    if (filters.tipo) newParams.set('tipo', filters.tipo);
    if (filters.nivel) newParams.set('nivel', filters.nivel);
    if (filters.search) newParams.set('search', filters.search);
    
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      categoria: undefined,
      tipo: undefined,
      nivel: undefined,
      search: '',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Guías <span className="text-primary">Sostenibles</span>
            </h1>
            <p className="text-muted-foreground">
              Aprende a vivir de manera más sostenible con nuestras guías prácticas
            </p>
          </div>
          
          {isAdmin && (
            <Button asChild>
              <Link to="/guias/nueva" className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Guía
              </Link>
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-8">
          <GuiasFilters
            categoria={filters.categoria}
            tipo={filters.tipo}
            nivel={filters.nivel}
            search={filters.search}
            onCategoriaChange={(categoria) => updateFilter('categoria', categoria)}
            onTipoChange={(tipo) => updateFilter('tipo', tipo)}
            onNivelChange={(nivel) => updateFilter('nivel', nivel)}
            onSearchChange={(search) => updateFilter('search', search)}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {guias.length} {guias.length === 1 ? 'guía encontrada' : 'guías encontradas'}
            </p>
          </div>
        )}

        {/* Guides Grid */}
        <GuiasGrid 
          guias={guias} 
          isLoading={isLoading}
          showAuthor={true}
        />

        {/* Load More Button */}
        {hasNextPage && !isLoading && (
          <div className="text-center mt-12">
            <Button 
              onClick={loadNextPage}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargar Más Guías
            </Button>
          </div>
        )}

        {/* Loading State for Load More */}
        {isLoading && guias.length > 0 && (
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando más guías...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}