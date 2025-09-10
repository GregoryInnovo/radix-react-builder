import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

// Category constants
export const CATEGORIAS_FUNCIONALIDAD = [
  'Control de Diabetes',
  'Manejo de Estrés y Ansiedad',
  'Mejorar el Sueño / Insomnio',
  'Salud Digestiva',
  'Control de Peso',
  'Presión Arterial',
  'Defensas e Inmunidad',
  'Dolor e Inflamación',
  'Energía y Vitalidad',
  'Relajación y Bienestar',
  'Detox y Limpieza',
  'Otros / Uso General'
];

export const CATEGORIAS_TIPO = [
  'Aromáticas e Infusiones',
  'Cápsulas y Tabletas',
  'Aceites esenciales',
  'Bebidas funcionales',
  'Polvos / Superfoods',
  'Tópicos (ungüentos, cremas)',
  'Homeopáticos',
  'Holísticos / Complementarios',
  'Otros'
];

interface ProductsFilterProps {
  selectedFuncionalidad: string[];
  selectedTipo: string[];
  onFuncionalidadChange: (categorias: string[]) => void;
  onTipoChange: (categorias: string[]) => void;
  onClearFilters: () => void;
}

export const ProductsFilter: React.FC<ProductsFilterProps> = ({
  selectedFuncionalidad,
  selectedTipo,
  onFuncionalidadChange,
  onTipoChange,
  onClearFilters
}) => {
  const hasActiveFilters = selectedFuncionalidad.length > 0 || selectedTipo.length > 0;

  const handleFuncionalidadToggle = (categoria: string) => {
    const newSelection = selectedFuncionalidad.includes(categoria)
      ? selectedFuncionalidad.filter(c => c !== categoria)
      : [...selectedFuncionalidad, categoria];
    onFuncionalidadChange(newSelection);
  };

  const handleTipoToggle = (categoria: string) => {
    const newSelection = selectedTipo.includes(categoria)
      ? selectedTipo.filter(c => c !== categoria)
      : [...selectedTipo, categoria];
    onTipoChange(newSelection);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filtros</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Funcionalidad */}
        <div>
          <h3 className="font-medium text-foreground mb-3">Funcionalidad</h3>
          <div className="space-y-2">
            {CATEGORIAS_FUNCIONALIDAD.map((categoria) => (
              <div key={categoria} className="flex items-center space-x-2">
                <Checkbox
                  id={`func-${categoria}`}
                  checked={selectedFuncionalidad.includes(categoria)}
                  onCheckedChange={() => handleFuncionalidadToggle(categoria)}
                />
                <label
                  htmlFor={`func-${categoria}`}
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  {categoria}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tipo de producto */}
        <div>
          <h3 className="font-medium text-foreground mb-3">Tipo de producto</h3>
          <div className="space-y-2">
            {CATEGORIAS_TIPO.map((categoria) => (
              <div key={categoria} className="flex items-center space-x-2">
                <Checkbox
                  id={`tipo-${categoria}`}
                  checked={selectedTipo.includes(categoria)}
                  onCheckedChange={() => handleTipoToggle(categoria)}
                />
                <label
                  htmlFor={`tipo-${categoria}`}
                  className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                >
                  {categoria}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};