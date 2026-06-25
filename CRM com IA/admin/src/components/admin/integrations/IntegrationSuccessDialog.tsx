import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { getIntegrationSuccessTitle } from '@/lib/integrationSuccess';

interface IntegrationSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationId: string;
  status: 'success' | 'error';
  items?: string[];
  errorMessage?: string;
}

export function IntegrationSuccessDialog({
  open,
  onOpenChange,
  integrationId,
  status,
  items = [],
  errorMessage,
}: IntegrationSuccessDialogProps) {
  const isSuccess = status === 'success';
  const title = isSuccess
    ? getIntegrationSuccessTitle(integrationId)
    : 'Não foi possível concluir a integração';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center sm:text-center">
          <div
            className={
              isSuccess
                ? 'mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15'
                : 'mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15'
            }
          >
            {isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {isSuccess ? (
              <>
                A integração está ativa no CRM. O status do card foi atualizado para{' '}
                <strong className="text-green-600">Ativo</strong>.
              </>
            ) : (
              errorMessage || 'Verifique as credenciais e tente novamente.'
            )}
          </DialogDescription>
        </DialogHeader>

        {isSuccess && items.length > 0 && (
          <ul className="rounded-lg border bg-muted/40 px-4 py-3 text-sm space-y-1">
            {items.map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter className="sm:justify-center">
          <Button
            className={isSuccess ? 'bg-green-600 hover:bg-green-600/90' : undefined}
            onClick={() => onOpenChange(false)}
          >
            {isSuccess ? 'Continuar no CRM' : 'Fechar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
