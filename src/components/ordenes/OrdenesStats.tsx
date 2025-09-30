import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, Package } from 'lucide-react';

interface OrdenesStatsProps {
  total: number;
  pendientes: number;
  aceptadas: number;
  completadas: number;
  canceladas: number;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

export const OrdenesStats: React.FC<OrdenesStatsProps> = ({
  total,
  pendientes,
  aceptadas,
  completadas,
  canceladas,
  selectedStatus,
  onStatusChange
}) => {
  const completionRate = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const getCardClasses = (status: string) => {
    const isSelected = selectedStatus === status;
    return `cursor-pointer transition-all hover:shadow-lg ${
      isSelected 
        ? 'ring-2 ring-[#22c55e] border-[#22c55e] shadow-md' 
        : 'hover:border-gray-300'
    }`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card className={getCardClasses('todas')} onClick={() => onStatusChange('todas')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% completadas
          </p>
        </CardContent>
      </Card>

      <Card className={getCardClasses('pendiente')} onClick={() => onStatusChange('pendiente')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendientes}</div>
          <p className="text-xs text-muted-foreground">
            En espera
          </p>
        </CardContent>
      </Card>

      <Card className={getCardClasses('aceptada')} onClick={() => onStatusChange('aceptada')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aceptadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{aceptadas}</div>
          <p className="text-xs text-muted-foreground">
            En proceso
          </p>
        </CardContent>
      </Card>

      <Card className={getCardClasses('completada')} onClick={() => onStatusChange('completada')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completadas}</div>
          <p className="text-xs text-muted-foreground">
            Finalizadas
          </p>
        </CardContent>
      </Card>

      <Card className={getCardClasses('cancelada')} onClick={() => onStatusChange('cancelada')}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{canceladas}</div>
          <p className="text-xs text-muted-foreground">
            No realizadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
