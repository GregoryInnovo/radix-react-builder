import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bookmark, X } from 'lucide-react';
import { GuiaCategoria } from '@/hooks/useGuias';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GuiasFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  showGuardadas: boolean;
  onToggleGuardadas: () => void;
  savedCount: number;
  categoria?: GuiaCategoria;
  onClearCategoria: () => void;
}

const categoriaLabels: Record<GuiaCategoria, string> = {
  sabias_que: '🧠 ¿Sabías que...?',
  reutilizacion_aprovechamiento: '♻️ Reutilización y aprovechamiento',
  manuales_tecnicos: '🧾 Manuales técnicos / operativos',
  salud_bienestar: '🌿 Salud y bienestar natural',
  impacto_sostenibilidad: '🌎 Impacto y sostenibilidad local',
};

export const GuiasFilters = ({
  search,
  onSearchChange,
  showGuardadas,
  onToggleGuardadas,
  savedCount,
  categoria,
  onClearCategoria,
}: GuiasFiltersProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [localSearch, setLocalSearch] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleToggleGuardadas = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para ver tus guías guardadas.",
        variant: "destructive",
      });
      return;
    }
    onToggleGuardadas();
  };

  const hasActiveFilters = categoria || search;

  return (
    <div className="space-y-4">
      {/* Search Bar and Guardadas Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por título o palabras clave"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-10"
              disabled={showGuardadas && !user}
            />
          </div>
          <Button type="submit" size="icon" variant="secondary">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        
        <Button
          variant={showGuardadas ? "default" : "outline"}
          onClick={handleToggleGuardadas}
          className="gap-2 min-w-[140px]"
        >
          <Bookmark className={`w-4 h-4 ${showGuardadas ? 'fill-current' : ''}`} />
          Guardadas
          {user && savedCount > 0 && (
            <Badge variant={showGuardadas ? "secondary" : "default"} className="ml-1 px-1.5 py-0.5 text-xs">
              {savedCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && !showGuardadas && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros activos:</span>
          
          {categoria && (
            <Badge variant="secondary" className="gap-1">
              {categoriaLabels[categoria]}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={onClearCategoria}
              />
            </Badge>
          )}
          
          {search && (
            <Badge variant="secondary" className="gap-1">
              Búsqueda: "{search}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
