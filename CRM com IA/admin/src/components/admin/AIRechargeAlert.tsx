import { AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAIAlert } from '@/hooks/useAIAlert';
import { AI_PROVIDERS, type AIProviderId } from '@/config/aiProvidersCatalog';

/**
 * Alerta GRANDE e piscante no topo do /admin quando TODOS os provedores de IA
 * cadastrados esgotaram (cota/queda). O failover silencioso (_shared/direct-ai.ts)
 * já tentou cada chave grátis→pago; este banner só aparece quando nada mais
 * respondeu. Some sozinho quando a IA volta (o backend limpa `exhausted`).
 */
export function AIRechargeAlert() {
  const { data: alert } = useAIAlert();

  if (!alert?.exhausted) return null;

  const provider = (alert.last_provider as AIProviderId) || null;
  const info = provider && AI_PROVIDERS[provider] ? AI_PROVIDERS[provider] : null;
  const billingUrl = info?.billingUrl;
  const providerName = info?.name ?? 'seu provedor de IA';

  return (
    <div
      role="alert"
      className="sticky top-0 z-50 border-y-2 border-red-500 bg-red-600 text-white animate-pulse shadow-lg"
    >
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <AlertTriangle className="h-7 w-7 shrink-0 animate-bounce" />
          <div className="min-w-0">
            <p className="text-base font-bold leading-tight">
              IA PARADA — recarga necessária
            </p>
            <p className="text-sm text-red-50">
              Todos os provedores de IA cadastrados estão sem crédito ou indisponíveis.
              Os agentes e recursos de IA não vão responder até a recarga de {providerName}.
            </p>
          </div>
        </div>
        {billingUrl && (
          <Button
            asChild
            size="lg"
            className="shrink-0 bg-white text-red-700 hover:bg-red-50 font-bold gap-2"
          >
            <a href={billingUrl} target="_blank" rel="noopener noreferrer">
              Recarregar {info?.shortName ?? ''}
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
