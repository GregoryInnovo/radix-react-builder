import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { GuiaCategoria, GuiaType, GuiaNivel } from '@/hooks/useGuias';

interface GuiasFiltersProps {
  categoria?: GuiaCategoria;
  tipo?: GuiaType;
  nivel?: GuiaNivel;
  search?: string;
  onCategoriaChange: (categoria?: GuiaCategoria) => void;
  onTipoChange: (tipo?: GuiaType) => void;
  onNivelChange: (nivel?: GuiaNivel) => void;
  onSearchChange: (search: string) => void;
  onClearFilters: () => void;
}

const categoriaOptions = [
  { value: 'sabias_que', label: '🧠 ¿Sabías que...?' },
  { value: 'reutilizacion_aprovechamiento', label: '♻️ Reutilización y aprovechamiento' },
  { value: 'manuales_tecnicos', label: '🧾 Manuales técnicos / operativos' },
  { value: 'salud_bienestar', label: '🌿 Salud y bienestar natural' },
  { value: 'impacto_sostenibilidad', label: '🌎 Impacto y sostenibilidad local' },
];

const tipoOptions = [
  { value: 'video', label: 'Videos' },
  { value: 'articulo', label: 'Artículos' },
  { value: 'infografia', label: 'Infografías' },
];

const nivelOptions = [
  { value: 'principiante', label: 'Principiante' },
  { value: 'intermedio', label: 'Intermedio' },
  { value: 'avanzado', label: 'Avanzado' },
];

export const GuiasFilters = ({
  categoria,
  tipo,
  nivel,
  search = '',
  onCategoriaChange,
  onTipoChange,
  onNivelChange,
  onSearchChange,
  onClearFilters,
}: GuiasFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = categoria || tipo || nivel || search;
  const activeFiltersCount = [categoria, tipo, nivel, search].filter(Boolean).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch);
  };

  const handleClearAll = () => {
    setLocalSearch('');
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar guías por título, descripción o tags..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-4"
        />
      </form>

      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            <X className="w-4 h-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoría</label>
            <Select
              value={categoria || "all"}
              onValueChange={(value) => 
                onCategoriaChange(value === "all" ? undefined : value as GuiaCategoria)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoriaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={tipo || "all"}
              onValueChange={(value) => 
                onTipoChange(value === "all" ? undefined : value as GuiaType)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {tipoOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Nivel</label>
            <Select
              value={nivel || "all"}
              onValueChange={(value) => 
                onNivelChange(value === "all" ? undefined : value as GuiaNivel)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {nivelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {categoria && (
            <Badge variant="secondary" className="gap-1">
              Categoría: {categoriaOptions.find(c => c.value === categoria)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onCategoriaChange(undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {tipo && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {tipoOptions.find(t => t.value === tipo)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onTipoChange(undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {nivel && (
            <Badge variant="secondary" className="gap-1">
              Nivel: {nivelOptions.find(n => n.value === nivel)?.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onNivelChange(undefined)}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
          {search && (
            <Badge variant="secondary" className="gap-1">
              "{search}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => {
                  setLocalSearch('');
                  onSearchChange('');
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};