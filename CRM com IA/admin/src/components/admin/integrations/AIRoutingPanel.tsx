import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Sparkles, Loader2 } from 'lucide-react';
import {
  CAPABILITY_LABELS,
  useAICredentials,
  useAIRouting,
  useSaveAIRouting,
  type AICapability,
  type AIProvider,
} from '@/hooks/useAIRouting';
import {
  getModelsForCapability,
  getDefaultModel,
  TAG_LABELS,
} from '@/config/aiModelsCatalog';
import {
  AI_PROVIDERS,
  AI_PROVIDER_IDS,
  PRICING_TIER_LABELS,
} from '@/config/aiProvidersCatalog';

const CAPABILITY_RESTRICTIONS: Partial<Record<AICapability, AIProvider[]>> = {
  audio_transcription: ['openai'],
  embeddings: ['openai', 'gemini'],
};

export function AIRoutingPanel() {
  const { data: credentials = [], isLoading: loadingCreds } = useAICredentials();
  const { data: routing = [], isLoading: loadingRouting } = useAIRouting();
  const save = useSaveAIRouting();

  const configuredProviders = new Set<AIProvider>(
    credentials.map((c) => c.provider as AIProvider),
  );

  const defaultProvider =
    AI_PROVIDER_IDS.find((id) => configuredProviders.has(id)) ?? 'gemini';

  const getRow = (cap: AICapability) => {
    const existing = routing.find((r) => r.capability === cap);
    if (existing) return existing;
    const provider = defaultProvider;
    return {
      capability: cap,
      provider,
      model: getDefaultModel(provider, cap) ?? null,
    };
  };

  const handleProviderChange = (cap: AICapability, provider: AIProvider) => {
    const current = getRow(cap);
    save.mutate({
      ...current,
      provider,
      model: getDefaultModel(provider, cap) ?? null,
    });
  };

  const handleModelChange = (cap: AICapability, model: string) => {
    const current = getRow(cap);
    save.mutate({ ...current, model });
  };

  if (loadingCreds || loadingRouting) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (configuredProviders.size === 0) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Cadastre pelo menos uma <strong>chave de API</strong> de um provedor (Gemini, OpenAI,
          Groq…) antes de configurar o roteamento. Cada empresa usa sua própria chave — o CRM não
          fornece IA da plataforma.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          CRM <strong>híbrido BYOK</strong>: escolha provedor e modelo por capacidade. Tudo usa a
          chave da <strong>sua empresa</strong>. Provedores com badge <strong>Free tier</strong>{' '}
          têm limites diários/por minuto no site do provedor — custos e limites variam por modelo.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-violet-500" />
            Roteamento de IA por capacidade
          </CardTitle>
          <CardDescription>
            Cada função do CRM (Copiloto, Agentes, Transcrição…) pode usar um provedor e modelo
            diferentes, todos com a mesma lógica: sua chave, seu billing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {(Object.keys(CAPABILITY_LABELS) as AICapability[]).map((cap) => {
            const row = getRow(cap);
            const restriction = CAPABILITY_RESTRICTIONS[cap];
            const providers: AIProvider[] =
              restriction ?? AI_PROVIDER_IDS;
            const meta = CAPABILITY_LABELS[cap];
            const availableModels = getModelsForCapability(row.provider, cap);
            const selectedModel =
              availableModels.find((m) => m.id === row.model) ?? availableModels[0];
            const providerInfo = AI_PROVIDERS[row.provider];

            return (
              <div key={cap} className="flex flex-col gap-3 rounded-lg border bg-card p-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{meta.title}</span>
                    {restriction && (
                      <Badge variant="outline" className="text-[10px]">
                        Só {restriction.map((p) => AI_PROVIDERS[p].shortName).join(' / ')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{meta.desc}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Provedor</label>
                    <Select
                      value={row.provider}
                      onValueChange={(v) => handleProviderChange(cap, v as AIProvider)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.map((p) => {
                          const info = AI_PROVIDERS[p];
                          const tier = PRICING_TIER_LABELS[info.pricingTier];
                          const enabled = configuredProviders.has(p);
                          return (
                            <SelectItem key={p} value={p} disabled={!enabled}>
                              <span className="flex items-center gap-2">
                                {info.shortName}
                                <span
                                  className={`text-[9px] rounded border px-1 ${tier.className}`}
                                >
                                  {tier.label}
                                </span>
                                {!enabled && ' — sem chave'}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {providerInfo.freeTierLimits && (
                      <p className="text-[10px] text-muted-foreground">
                        {providerInfo.freeTierLimits}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Modelo</label>
                    <Select
                      value={selectedModel?.id ?? ''}
                      onValueChange={(v) => handleModelChange(cap, v)}
                      disabled={availableModels.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[420px]">
                        {availableModels.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex flex-col gap-1 py-0.5">
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="font-medium">{m.label}</span>
                                {m.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className={`inline-flex items-center rounded border px-1.5 py-0 text-[9px] font-medium ${TAG_LABELS[tag].className}`}
                                  >
                                    {TAG_LABELS[tag].label}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {m.description}
                                {m.costHint ? ` · ${m.costHint}` : ''}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedModel && (
                  <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                    <span>Em uso:</span>
                    <span className="font-mono text-foreground">{selectedModel.id}</span>
                    {selectedModel.costHint && (
                      <Badge variant="outline" className="text-[9px]">
                        {selectedModel.costHint}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
