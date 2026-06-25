import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  ExternalLink,
  Webhook,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Info,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAICredentials, useSaveAICredential, useDeleteAICredential } from '@/hooks/useAIRouting';
import { AIRoutingPanel } from './AIRoutingPanel';
import {
  AI_PROVIDERS,
  PRICING_TIER_LABELS,
  type AIProviderId,
} from '@/config/aiProvidersCatalog';

function AIProviderConfig({ provider }: { provider: AIProviderId }) {
  const meta = AI_PROVIDERS[provider];
  const tier = PRICING_TIER_LABELS[meta.pricingTier];
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { data: credentials = [] } = useAICredentials();
  const save = useSaveAICredential();
  const del = useDeleteAICredential();

  const current = credentials.find((c) => c.provider === provider);
  const isConfigured = !!current;

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Cole a API Key antes de salvar');
      return;
    }
    save.mutate({ provider, api_key: apiKey.trim() }, { onSuccess: () => setApiKey('') });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{meta.name}</CardTitle>
            <CardDescription>{meta.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isConfigured && (
              <Badge className="bg-green-600 text-white border-green-600">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Ativo
              </Badge>
            )}
            <Badge variant="outline" className={tier.className}>
              {tier.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConfigured ? (
          <>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Integração ativa e verificada
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Chave: {current?.api_key_masked || '••••••'}
                    {current?.last_verified_at && (
                      <> · Verificada em {new Date(current.last_verified_at).toLocaleDateString('pt-BR')}</>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Sua chave, seu billing</AlertTitle>
              <AlertDescription className="text-xs space-y-1">
                <p>{meta.pricingSummary}</p>
                {meta.freeTierLimits && (
                  <p><strong>Limites free:</strong> {meta.freeTierLimits}</p>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => del.mutate(provider)}
                disabled={del.isPending}
              >
                {del.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Descadastrar chave
              </Button>
              <Button variant="outline" asChild>
                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {meta.docsLabel}
                </a>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Sua chave, seu billing</AlertTitle>
              <AlertDescription className="text-xs space-y-1">
                <p>{meta.pricingSummary}</p>
                {meta.freeTierLimits && (
                  <p><strong>Limites free:</strong> {meta.freeTierLimits}</p>
                )}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="relative">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={meta.keyPlaceholder}
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">{meta.keyHint}</p>
              <p className="text-xs text-muted-foreground">
                Depois de salvar, configure o uso em <strong>Roteamento de IA</strong>.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={save.isPending || !apiKey.trim()}>
                {save.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar e verificar
              </Button>
              <Button variant="outline" asChild>
                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {meta.docsLabel}
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function OpenAIConfig() {
  return <AIProviderConfig provider="openai" />;
}
export function ClaudeConfig() {
  return <AIProviderConfig provider="anthropic" />;
}
export function GeminiConfig() {
  return <AIProviderConfig provider="gemini" />;
}
export function PerplexityConfig() {
  return <AIProviderConfig provider="perplexity" />;
}
export function GroqConfig() {
  return <AIProviderConfig provider="groq" />;
}
export function DeepSeekConfig() {
  return <AIProviderConfig provider="deepseek" />;
}
export function MistralConfig() {
  return <AIProviderConfig provider="mistral" />;
}
export function TogetherConfig() {
  return <AIProviderConfig provider="together" />;
}
export function OpenRouterConfig() {
  return <AIProviderConfig provider="openrouter" />;
}
export function QwenConfig() {
  return <AIProviderConfig provider="qwen" />;
}
export function ElevenLabsConfig() {
  return <AIProviderConfig provider="elevenlabs" />;
}
export function VeoConfig() {
  return <AIProviderConfig provider="veo" />;
}
export function BananaConfig() {
  return <AIProviderConfig provider="banana" />;
}
export function CerebrasConfig() {
  return <AIProviderConfig provider="cerebras" />;
}
export function FireworksConfig() {
  return <AIProviderConfig provider="fireworks" />;
}
export function XAIConfig() {
  return <AIProviderConfig provider="xai" />;
}
export function CohereConfig() {
  return <AIProviderConfig provider="cohere" />;
}
export function ReplicateConfig() {
  return <AIProviderConfig provider="replicate" />;
}
export function RunwayConfig() {
  return <AIProviderConfig provider="runway" />;
}
export function StabilityConfig() {
  return <AIProviderConfig provider="stability" />;
}

export function AIRoutingConfig() {
  return <AIRoutingPanel />;
}

export function WebhooksLink() {
  const navigate = useNavigate();
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
            <Webhook className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Webhooks Customizados</CardTitle>
            <CardDescription>Configurados em Automação & IA → Webhooks</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Os webhooks customizados ficam em uma seção dedicada no menu lateral.
        </p>
        <Button onClick={() => navigate('/?section=webhooks')}>
          Abrir Webhooks
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
