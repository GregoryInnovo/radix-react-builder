import React from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { getShortId, copyToClipboard } from '@/lib/utils';

interface EntityIdDisplayProps {
  id: string;
  label?: string;
  showCopyButton?: boolean;
  className?: string;
}

export const EntityIdDisplay: React.FC<EntityIdDisplayProps> = ({
  id,
  label = 'ID',
  showCopyButton = true,
  className = ''
}) => {
  const [copied, setCopied] = React.useState(false);
  const shortId = getShortId(id);

  const handleCopy = async () => {
    const success = await copyToClipboard(id);
    if (success) {
      setCopied(true);
      toast({
        title: "ID copiado",
        description: "El ID completo ha sido copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Error",
        description: "No se pudo copiar el ID",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">{label}:</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <code className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm font-mono cursor-help">
                {shortId}
              </code>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs">{id}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {showCopyButton && (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 w-7 p-0"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
};
