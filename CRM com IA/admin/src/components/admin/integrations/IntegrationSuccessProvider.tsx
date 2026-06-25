import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  INTEGRATION_OPEN_STORAGE_KEY,
  readIntegrationReturnFromSearch,
  stripIntegrationReturnFromUrl,
} from '@/lib/integrationSuccess';
import {
  registerIntegrationSuccessNotify,
  type IntegrationNotifyOptions,
} from '@/lib/integrationSuccessNotify';
import { IntegrationSuccessDialog } from './IntegrationSuccessDialog';

type DialogState = {
  open: boolean;
  integrationId: string;
  status: 'success' | 'error';
  items: string[];
  errorMessage?: string;
};

interface IntegrationSuccessProviderProps {
  children: ReactNode;
  onNavigateToIntegrations: (integrationId: string | null) => void;
}

export function IntegrationSuccessProvider({
  children,
  onNavigateToIntegrations,
}: IntegrationSuccessProviderProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const openDialog = useCallback(
    (integrationId: string, options?: IntegrationNotifyOptions) => {
      const status = options?.status ?? 'success';
      setDialog({
        open: true,
        integrationId,
        status,
        items: options?.items ?? [],
        errorMessage: options?.message,
      });

      if (status === 'success') {
        if (!options?.skipOpenDrawer) {
          sessionStorage.setItem(INTEGRATION_OPEN_STORAGE_KEY, integrationId);
        }
        onNavigateToIntegrations(integrationId);
        qc.invalidateQueries({ queryKey: ['integration-settings'] });
        qc.invalidateQueries({ queryKey: ['all-integration-settings'] });
        qc.invalidateQueries({ queryKey: ['social-channels'] });
        qc.invalidateQueries({ queryKey: ['social-channels-active'] });
        qc.invalidateQueries({ queryKey: ['org-ai-credentials'] });
      }
    },
    [onNavigateToIntegrations, qc],
  );

  useEffect(() => {
    registerIntegrationSuccessNotify((id, opts) => openDialog(id, opts));
    return () => registerIntegrationSuccessNotify(null);
  }, [openDialog]);

  // Retorno por URL (OAuth Meta, Google Calendar admin, etc.)
  useEffect(() => {
    const payload = readIntegrationReturnFromSearch(searchParams.toString());
    if (!payload) return;

    const integrationId = payload.integrationId ?? 'facebook-messenger';

    if (payload.status === 'success') {
      openDialog(integrationId, {
        items: payload.items,
        message: payload.message || undefined,
      });
    } else {
      openDialog(integrationId, {
        status: 'error',
        message: payload.message || 'Não foi possível concluir a integração',
        skipOpenDrawer: true,
      });
      toast.error(payload.message || 'Falha na integração');
    }

    const next = new URLSearchParams(searchParams);
    [
      'int_status',
      'int_message',
      'int_items',
      'int_id',
      'meta_status',
      'meta_message',
      'meta_count',
      'meta_items',
      'integration',
      'google_calendar_connected',
      'google_calendar_error',
      'tab',
    ].forEach((k) => next.delete(k));
    setSearchParams(next, { replace: true });
    queueMicrotask(() => stripIntegrationReturnFromUrl());
  }, [searchParams, setSearchParams, openDialog]);

  return (
    <>
      {children}
      {dialog && (
        <IntegrationSuccessDialog
          open={dialog.open}
          onOpenChange={(open) => {
            if (!open) setDialog(null);
            else setDialog((d) => (d ? { ...d, open } : null));
          }}
          integrationId={dialog.integrationId}
          status={dialog.status}
          items={dialog.items}
          errorMessage={dialog.errorMessage}
        />
      )}
    </>
  );
}
