import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle } from 'lucide-react';

interface RequestLimitWarningProps {
  requestCount: number;
  itemType: 'lote' | 'producto';
  onConfirm: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const RequestLimitWarning: React.FC<RequestLimitWarningProps> = ({
  requestCount,
  itemType,
  onConfirm,
  disabled = false,
  children
}) => {
  const remainingRequests = 5 - requestCount;
  const isNearLimit = requestCount >= 3;
  const isAtLimit = requestCount >= 5;

  if (isAtLimit) {
    return (
      <Button disabled className="w-full opacity-50">
        <MessageSquare className="w-4 h-4 mr-2" />
        Límite alcanzado (5/5)
      </Button>
    );
  }

  if (!isNearLimit) {
    return (
      <Button onClick={onConfirm} disabled={disabled} className="w-full">
        {children}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={disabled} className="w-full">
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Confirmar Solicitud
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Has solicitado <strong>{requestCount} veces</strong> este {itemType} ¿seguro que quieres continuar?
            </p>
            <p className="text-sm text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
              <strong>Solicitudes restantes: {remainingRequests}</strong>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Sí, continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};