import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Plug, Sparkles, LayoutGrid, Menu } from 'lucide-react';
import { findIntegrationItem, INTEGRATION_OPEN_STORAGE_KEY } from '@/lib/integrationSuccess';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { integrationsCatalog, type IntegrationItem } from '@/config/integrationsCatalog';
import { IntegrationCard } from './IntegrationCard';
import { IntegrationConfigDrawer } from './IntegrationConfigDrawer';
import { useIntegrations } from '@/hooks/useIntegrations';
import { useAICredentials, useAIRouting } from '@/hooks/useAIRouting';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveOrganizationId } from '@/hooks/useEffectiveOrganizationId';
import { extraTable } from '@/lib/supabaseExtra';

type StatusFilter = 'all' | 'active' | 'inactive' | 'coming_soon';
type CategoryFilter = 'all' | string;

function useAllConfiguredIntegrations() {
  return useQuery({
    queryKey: ['all-integration-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_credentials')
        .select('provider, is_active');
      if (error) throw error;
      const map: Record<string, boolean> = {};
      (data ?? []).forEach((row) => {
        if (row.is_active) map[row.provider] = true;
      });
      return map;
    },
  });
}

export function IntegrationsManager() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [selected, setSelected] = useState<IntegrationItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: orgId, isLoading: orgLoading } = useEffectiveOrganizationId();
  useIntegrations();
  const { data: configuredMap = {} } = useAllConfiguredIntegrations();
  const { data: aiCredentials = [] } = useAICredentials();
  const { data: aiRouting = [] } = useAIRouting();
  const marketingLeadsStatus: any = null;

  // Abre drawer da integração (OAuth return, link do Engajamento/Inbox, ?integration= na URL).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('integration') ?? params.get('open');
    const integrationId =
      fromUrl || sessionStorage.getItem(INTEGRATION_OPEN_STORAGE_KEY);
    if (!integrationId) return;
    sessionStorage.removeItem(INTEGRATION_OPEN_STORAGE_KEY);
    const item = findIntegrationItem(integrationId);
    if (item) {
      setSelected(item);
      setDrawerOpen(true);
      setCategoryFilter('channels');
    }
  }, []);

  const isItemActive = (item: IntegrationItem) => {
    if (item.alwaysActive) return true;
    if (configuredMap[item.id]) return true;
    if (item.id === 'whatsapp' && configuredMap['whatsapp_provider']) return true;
    if (item.id === 'botconversa' && configuredMap['whatsapp_provider']) return true;
    if (item.id === 'email-config' && configuredMap['email_config']) return true;
    if (item.id === 'smtp-custom' && configuredMap['smtp_custom']) return true;
    const emailChannelReady =
      !!configuredMap['email_config'] || !!configuredMap['smtp_custom'];
    if (item.id === 'email-templates' && emailChannelReady) return true;
    if (item.id === 'mass-email' && emailChannelReady) return true;
    if (item.id === 'sankhya' && configuredMap['sankhya']) return true;
    if (item.id === 'google-calendar' && configuredMap['google_calendar']) return true;
    if (item.id === 'google-ads' && marketingLeadsStatus?.google_ads) return true;
    if (item.id === 'tiktok-ads' && marketingLeadsStatus?.tiktok) return true;
    if (item.id === 'stripe' && configuredMap['stripe']) return true;
    if (item.id === 'mercadopago' && configuredMap['mercadopago']) return true;
    if (item.id === 'asaas' && configuredMap['asaas']) return true;
    if (item.id === 'pagarme' && configuredMap['pagarme']) return true;
    if (item.id === 'pix-direto' && configuredMap['pix_direto']) return true;
    if (item.id === 'doppus' && configuredMap['doppus']) return true;
    if (item.id === 'sankhya' && configuredMap['sankhya']) return true;
    if (item.id === 'google-calendar' && configuredMap['google_calendar_oauth']) return true;
    if (item.id === 'outlook' && configuredMap['outlook_calendar_oauth']) return true;
    if (item.id === 'api-keys' && configuredMap['resend']) return true;
    if (item.id === 'firecrawl' && configuredMap['firecrawl']) return true;
    if (item.id === 'zapier' && configuredMap['zapier']) return true;
    if (item.id === 'openai' && aiCredentials.some((c) => c.provider === 'openai' && c.api_key_masked))
      return true;
    if (item.id === 'anthropic' && aiCredentials.some((c) => c.provider === 'anthropic' && c.api_key_masked))
      return true;
    if (item.id === 'gemini' && aiCredentials.some((c) => c.provider === 'gemini' && c.api_key_masked))
      return true;
    if (
      item.id === 'perplexity' &&
      aiCredentials.some((c) => c.provider === 'perplexity' && c.api_key_masked)
    )
      return true;
    if (item.id === 'groq' && aiCredentials.some((c) => c.provider === 'groq' && c.api_key_masked))
      return true;
    if (
      item.id === 'deepseek' &&
      aiCredentials.some((c) => c.provider === 'deepseek' && c.api_key_masked)
    )
      return true;
    if (
      item.id === 'mistral' &&
      aiCredentials.some((c) => c.provider === 'mistral' && c.api_key_masked)
    )
      return true;
    if (
      item.id === 'together' &&
      aiCredentials.some((c) => c.provider === 'together' && c.api_key_masked)
    )
      return true;
    if (item.id === 'ai-routing' && aiRouting.length > 0) return true;
    return false;
  };

  const handleClick = (item: IntegrationItem) => {
    if (item.comingSoon) {
      toast.info(`${item.name} estará disponível em breve!`, {
        description: 'Vamos avisar você assim que liberarmos.',
      });
      return;
    }
    setSelected(item);
    setDrawerOpen(true);
  };

  const filtered = useMemo(() => {
    return integrationsCatalog
      .map((cat) => {
        const items = cat.items.filter((item) => {
          if (statusFilter === 'coming_soon' && !item.comingSoon) return false;
          if (statusFilter === 'active' && (item.comingSoon || !isItemActive(item))) return false;
          if (statusFilter === 'inactive' && (item.comingSoon || isItemActive(item))) return false;
          if (categoryFilter !== 'all' && cat.id !== categoryFilter) return false;
          return true;
        });
        return { ...cat, items };
      })
      .filter((cat) => cat.items.length > 0);
  }, [
    statusFilter,
    categoryFilter,
    configuredMap,
    aiCredentials,
    aiRouting,
    marketingLeadsStatus,
  ]);

  const totals = useMemo(() => {
    const all = integrationsCatalog.flatMap((c) => c.items);
    const available = all.filter((i) => !i.comingSoon).length;
    const active = all.filter((i) => !i.comingSoon && isItemActive(i)).length;
    return { active, available, total: all.length };
  }, [configuredMap, aiCredentials, aiRouting, marketingLeadsStatus]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, { total: number; active: number }> = {};
    integrationsCatalog.forEach((cat) => {
      const total = cat.items.length;
      const active = cat.items.filter((i) => !i.comingSoon && isItemActive(i)).length;
      map[cat.id] = { total, active };
    });
    return map;
  }, [configuredMap, aiCredentials, aiRouting, marketingLeadsStatus]);

  const renderSidebar = (onSelect?: () => void) => (
    <nav className="space-y-1">
      <button
        onClick={() => {
          setCategoryFilter('all');
          onSelect?.();
        }}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
          categoryFilter === 'all'
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent text-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        <span className="flex-1 truncate">Todos</span>
        <Badge
          variant={categoryFilter === 'all' ? 'secondary' : 'outline'}
          className="text-[10px] px-1.5 py-0 h-5"
        >
          {totals.total}
        </Badge>
      </button>

      <div className="pt-2 pb-1 px-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          Categorias
        </p>
      </div>

      {integrationsCatalog.map((cat) => {
        const Icon = cat.icon;
        const isActive = categoryFilter === cat.id;
        const counts = categoryCounts[cat.id];
        return (
          <button
            key={cat.id}
            onClick={() => {
              setCategoryFilter(cat.id);
              onSelect?.();
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{cat.label}</span>
            <Badge
              variant={isActive ? 'secondary' : 'outline'}
              className="text-[10px] px-1.5 py-0 h-5"
            >
              {counts.active}/{counts.total}
            </Badge>
          </button>
        );
      })}
    </nav>
  );

  const activeCategoryLabel =
    categoryFilter === 'all'
      ? 'Todas as integrações'
      : integrationsCatalog.find((c) => c.id === categoryFilter)?.label ?? 'Integrações';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plug className="h-6 w-6 text-primary" />
            Integrações
          </h2>
          <p className="text-muted-foreground">
            Conecte ferramentas e serviços ao seu CRM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {totals.active} de {totals.available} ativas
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-xl border bg-card p-3">
            {renderSidebar()}
          </div>
        </aside>

        {/* Main content */}
        <div className="space-y-4 min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Mobile category trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2 justify-start">
                  <Menu className="h-4 w-4" />
                  <span className="truncate">{activeCategoryLabel}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-xs p-4 overflow-y-auto">
                <div className="mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Plug className="h-4 w-4 text-primary" />
                    Categorias
                  </h3>
                </div>
                {renderSidebar(() => setMobileMenuOpen(false))}
              </SheetContent>
            </Sheet>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:max-w-xs lg:ml-auto">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Não configuradas</SelectItem>
                <SelectItem value="coming_soon">Em breve</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <Plug className="mx-auto h-8 w-8 text-muted-foreground" />
              <h3 className="mt-3 font-medium">Nenhuma integração neste filtro</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Altere a categoria ou o filtro de status para ver outras integrações.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filtered.map((cat) => {
                const Icon = cat.icon;
                return (
                  <section key={cat.id}>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{cat.label}</h3>
                        {cat.description && (
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="ml-auto text-[10px]">
                        {cat.items.length}
                      </Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {cat.items.map((item) => (
                        <IntegrationCard
                          key={item.id}
                          item={item}
                          isActive={isItemActive(item)}
                          onClick={() => handleClick(item)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <IntegrationConfigDrawer
        item={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
