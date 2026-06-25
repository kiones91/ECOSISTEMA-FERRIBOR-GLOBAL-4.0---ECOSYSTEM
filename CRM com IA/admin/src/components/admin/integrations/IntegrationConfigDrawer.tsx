import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import type { IntegrationItem } from '@/config/integrationsCatalog';
import { ApiKeysManager } from './ApiKeysManager';
import { WhatsAppConfig } from './WhatsAppConfig';
import { BotConversaConfig } from './BotConversaConfig';
import { EmailConfigManager } from './EmailConfigManager';
import { EmailTemplatesManager } from './EmailTemplatesManager';
import { MassEmailManager } from './MassEmailManager';
import { SankhyaConfigManager } from './SankhyaConfigManager';
import { SmtpCustomConfigManager } from './SmtpCustomConfigManager';
import {
  OpenAIConfig,
  ClaudeConfig,
  GeminiConfig,
  PerplexityConfig,
  GroqConfig,
  DeepSeekConfig,
  MistralConfig,
  TogetherConfig,
  OpenRouterConfig,
  QwenConfig,
  ElevenLabsConfig,
  VeoConfig,
  BananaConfig,
  CerebrasConfig,
  FireworksConfig,
  XAIConfig,
  CohereConfig,
  ReplicateConfig,
  RunwayConfig,
  StabilityConfig,
  WebhooksLink,
  AIRoutingConfig,
} from './AIProviderConfigs';

interface IntegrationConfigDrawerProps {
  item: IntegrationItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IntegrationConfigDrawer({ item, open, onOpenChange }: IntegrationConfigDrawerProps) {
  const renderBody = () => {
    if (!item?.configKey) return null;
    switch (item.configKey) {
      case 'whatsapp':
        return <WhatsAppConfig />;
      case 'botconversa':
        return <BotConversaConfig />;
      case 'google-ads':
      case 'tiktok-ads':
      case 'instagram-leads':
        return null;
      case 'email-config':
        return <EmailConfigManager />;
      case 'email-templates':
        return <EmailTemplatesManager />;
      case 'mass-email':
        return <MassEmailManager />;
      case 'smtp-custom':
        return <SmtpCustomConfigManager />;
      case 'google-calendar':
      case 'outlook-calendar':
        return null;
      case 'sankhya':
        return <SankhyaConfigManager />;
      case 'api-keys':
        return <ApiKeysManager />;
      case 'openai':
        return <OpenAIConfig />;
      case 'anthropic':
        return <ClaudeConfig />;
      case 'gemini':
        return <GeminiConfig />;
      case 'perplexity':
        return <PerplexityConfig />;
      case 'groq':
        return <GroqConfig />;
      case 'deepseek':
        return <DeepSeekConfig />;
      case 'mistral':
        return <MistralConfig />;
      case 'together':
        return <TogetherConfig />;
      case 'openrouter':
        return <OpenRouterConfig />;
      case 'qwen':
        return <QwenConfig />;
      case 'elevenlabs':
        return <ElevenLabsConfig />;
      case 'veo':
        return <VeoConfig />;
      case 'banana':
        return <BananaConfig />;
      case 'cerebras':
        return <CerebrasConfig />;
      case 'fireworks':
        return <FireworksConfig />;
      case 'xai':
        return <XAIConfig />;
      case 'cohere':
        return <CohereConfig />;
      case 'replicate':
        return <ReplicateConfig />;
      case 'runway':
        return <RunwayConfig />;
      case 'stability':
        return <StabilityConfig />;
      case 'ai-routing':
        return <AIRoutingConfig />;
      case 'webhooks-link':
        return <WebhooksLink />;
      default:
        return null;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 sm:max-w-2xl lg:max-w-3xl"
      >
        {item && (
          <>
            <SheetHeader className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur">
              <SheetTitle className="flex items-center gap-2">
                {item.logoSrc ? (
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-background ring-1 ring-border">
                    <img src={item.logoSrc} alt="" className="h-full w-full object-cover" />
                  </span>
                ) : (
                  <span className={`flex h-8 w-8 items-center justify-center rounded-md ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </span>
                )}
                {item.name}
              </SheetTitle>
              <SheetDescription>{item.description}</SheetDescription>
            </SheetHeader>
            <div className="px-6 py-6">{renderBody()}</div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
