import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrdenesFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  counts: {
    todas: number;
    pendiente: number;
    aceptada: number;
    completada: number;
    cancelada: number;
  };
}

export const OrdenesFilters: React.FC<OrdenesFiltersProps> = ({
  selectedStatus,
  onStatusChange,
  counts
}) => {
  const filters = [
    { value: 'todas', label: 'Todas', count: counts.todas },
    { value: 'pendiente', label: 'Pendientes', count: counts.pendiente },
    { value: 'aceptada', label: 'Aceptadas', count: counts.aceptada },
    { value: 'completada', label: 'Completadas', count: counts.completada },
    { value: 'cancelada', label: 'Canceladas', count: counts.cancelada }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={selectedStatus === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(filter.value)}
          className="relative"
        >
          {filter.label}
          {filter.count > 0 && (
            <Badge 
              variant="secondary" 
              className="ml-2 h-5 min-w-5 rounded-full px-1.5 text-xs"
            >
              {filter.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
};
