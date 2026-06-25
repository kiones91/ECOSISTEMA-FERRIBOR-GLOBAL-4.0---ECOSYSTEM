import { notifyIntegrationError, notifyIntegrationSuccess } from '@/lib/integrationSuccessNotify';

/** Atalho para popup padronizado após salvar/conectar integração no drawer. */
export function useIntegrationSuccessNotify() {
  return {
    notifySuccess: notifyIntegrationSuccess,
    notifyError: notifyIntegrationError,
  };
}
