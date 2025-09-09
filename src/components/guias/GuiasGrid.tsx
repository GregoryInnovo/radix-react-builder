import { GuiaCard } from './GuiaCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Guia } from '@/hooks/useGuias';

interface GuiasGridProps {
  guias: Guia[];
  isLoading?: boolean;
  showAuthor?: boolean;
}

export const GuiasGrid = ({ guias, isLoading = false, showAuthor = false }: GuiasGridProps) => {
  if (isLoading && guias.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (guias.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No hay guías disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron guías que coincidan con los filtros seleccionados.
            Intenta ajustar tus criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {guias.map((guia) => (
        <GuiaCard 
          key={guia.id} 
          guia={guia} 
          showAuthor={showAuthor}
        />
      ))}
    </div>
  );
};