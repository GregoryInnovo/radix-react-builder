import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { GuiasFilters } from '@/components/guias/GuiasFilters';
import { GuiasGrid } from '@/components/guias/GuiasGrid';
import { GuiasCategoriesSection } from '@/components/guias/GuiasCategoriesSection';
import { Button } from '@/components/ui/button';
import { useGuias, GuiaCategoria } from '@/hooks/useGuias';
import { useGuiasGuardadas } from '@/hooks/useGuiasGuardadas';
import { useAdmin } from '@/hooks/useAdmin';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Guias() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin } = useAdmin();
  const { guiasGuardadas, isLoading: isLoadingGuardadas } = useGuiasGuardadas();
  
  const [showGuardadas, setShowGuardadas] = useState(false);
  
  // Get initial values from URL params
  const [filters, setFilters] = useState({
    categoria: searchParams.get('categoria') as GuiaCategoria | undefined,
    search: searchParams.get('search') || '',
  });

  const { guias, isLoading, hasNextPage, loadNextPage } = useGuias(filters);

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (filters.categoria) newParams.set('categoria', filters.categoria);
    if (filters.search) newParams.set('search', filters.search);
    
    setSearchParams(newParams);
  }, [filters, setSearchParams]);

  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      categoria: undefined,
      search: '',
    });
  };

  // Prepare displayed guides based on showGuardadas state
  const displayedGuias = showGuardadas 
    ? guiasGuardadas.map(item => item.guias).filter((guia): guia is any => guia !== null && guia !== undefined) as any[]
    : guias;

  // Filter saved guides by search if needed
  const filteredDisplayedGuias = showGuardadas && filters.search
    ? displayedGuias.filter(guia => 
        guia.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
        guia.descripcion.toLowerCase().includes(filters.search.toLowerCase())
      )
    : displayedGuias;

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

        {/* Categories Section */}
        <GuiasCategoriesSection 
          selectedCategoria={filters.categoria}
          onSelectCategoria={(slug) => {
            if (filters.categoria === slug) {
              updateFilter('categoria', undefined);
            } else {
              updateFilter('categoria', slug as GuiaCategoria);
            }
          }}
        />

        {/* Filters */}
        <div className="mb-8">
          <GuiasFilters
            search={filters.search}
            onSearchChange={(search) => updateFilter('search', search)}
            showGuardadas={showGuardadas}
            onToggleGuardadas={() => {
              setShowGuardadas(!showGuardadas);
              if (!showGuardadas) {
                // Clear categoria filter when showing saved guides
                setFilters(prev => ({ ...prev, categoria: undefined }));
              }
            }}
            savedCount={guiasGuardadas.length}
            categoria={filters.categoria}
            onClearCategoria={() => updateFilter('categoria', undefined)}
          />
        </div>

        {/* Results Count */}
        {!(showGuardadas ? isLoadingGuardadas : isLoading) && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {showGuardadas && (
                <span className="font-medium">Guardadas: </span>
              )}
              {filteredDisplayedGuias.length} {filteredDisplayedGuias.length === 1 ? 'guía encontrada' : 'guías encontradas'}
            </p>
          </div>
        )}

        {/* Guides Grid */}
        <GuiasGrid 
          guias={filteredDisplayedGuias} 
          isLoading={showGuardadas ? isLoadingGuardadas : isLoading}
          showAuthor={true}
        />

        {/* Load More Button - only show when not viewing saved guides */}
        {!showGuardadas && hasNextPage && !isLoading && (
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
        {!showGuardadas && isLoading && guias.length > 0 && (
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