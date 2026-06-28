import { useState, Suspense, useEffect, useRef, useTransition, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IntegrationSuccessProvider } from '@/components/admin/integrations/IntegrationSuccessProvider';
import { consumeAdminNavSection } from '@/lib/crmNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MobileAdminLayout } from '@/components/admin/MobileAdminLayout';
import { ComingSoonSection } from '@/components/admin/ComingSoonSection';
import { SectionErrorBoundary } from '@/components/admin/SectionErrorBoundary';
import { lazyWithRetry, prefetch, onIdle } from '@/lib/lazyWithRetry';
import { allMenuItems } from '@/config/adminMenu';
import { OnboardingBanner } from '@/components/onboarding/OnboardingBanner';
import { AIRechargeAlert } from '@/components/admin/AIRechargeAlert';
import { AIGlobalToggle } from '@/components/admin/AIGlobalToggle';


// Factories nomeadas para podermos reutilizá-las no prefetch on-hover.
const f = {
  AdminDashboard: () => import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })),
  OrdersManager: () => import('@/components/admin/orders/OrdersManager').then(m => ({ default: m.OrdersManager })),
  CertificatesManager: () => import('@/components/admin/certificates/CertificatesManager').then(m => ({ default: m.CertificatesManager })),
  IntegrationsManager: () => import('@/components/admin/integrations/IntegrationsManager').then(m => ({ default: m.IntegrationsManager })),
  NotificationManager: () => import('@/components/admin/NotificationManager').then(m => ({ default: m.NotificationManager })),
  InboxManager: () => import('@/components/admin/InboxManager').then(m => ({ default: m.InboxManager })),
  CaptureManager: () => import('@/components/admin/capture/CaptureManager').then(m => ({ default: m.CaptureManager })),
  CustomFieldsManager: () => import('@/components/admin/CustomFieldsManager').then(m => ({ default: m.CustomFieldsManager })),
  AgentsManager: () => import('@/components/admin/agents/AgentsManager').then(m => ({ default: m.AgentsManager })),
  EvolutionInstancesPanel: () => import('@/components/admin/integrations/EvolutionInstancesPanel').then(m => ({ default: m.EvolutionInstancesPanel })),
  TagsManager: () => import('@/components/admin/tags/TagsManager').then(m => ({ default: m.TagsManager })),
  BusinessHoursManager: () => import('@/components/admin/schedules/BusinessHoursManager').then(m => ({ default: m.BusinessHoursManager })),
  // Seções de Plataforma (antiga tela Super Admin, agora absorvida na tela única).
  PlatformWhatsApp: () => import('@/components/superadmin/EvolutionManager').then(m => ({ default: m.EvolutionManager })),
  PlatformAgentTools: () => import('@/components/superadmin/AgentToolExecutionsPanel').then(m => ({ default: m.AgentToolExecutionsPanel })),
  PlatformAIQuality: () => import('@/components/superadmin/AIQualityPanel').then(m => ({ default: m.AIQualityPanel })),
  PlatformEmail: () => import('@/components/superadmin/EmailSettings').then(m => ({ default: m.EmailSettings })),
  PlatformAudit: () => import('@/components/superadmin/AuditLogs').then(m => ({ default: m.AuditLogs })),
};

// Lazy components (com retry + cache compartilhado para prefetch).
const AdminDashboard = lazyWithRetry(f.AdminDashboard);
const OrdersManager = lazyWithRetry(f.OrdersManager);
const CertificatesManager = lazyWithRetry(f.CertificatesManager);
const IntegrationsManager = lazyWithRetry(f.IntegrationsManager);
const NotificationManager = lazyWithRetry(f.NotificationManager);
const InboxManager = lazyWithRetry(f.InboxManager);
const CaptureManager = lazyWithRetry(f.CaptureManager);
const CustomFieldsManager = lazyWithRetry(f.CustomFieldsManager);
const AgentsManager = lazyWithRetry(f.AgentsManager);
const EvolutionInstancesPanel = lazyWithRetry(f.EvolutionInstancesPanel);
const TagsManager = lazyWithRetry(f.TagsManager);
const BusinessHoursManager = lazyWithRetry(f.BusinessHoursManager);

// Seções de Plataforma (antiga tela Super Admin, absorvida na tela única).
const PlatformWhatsApp = lazyWithRetry(f.PlatformWhatsApp);
const PlatformAgentTools = lazyWithRetry(f.PlatformAgentTools);
const PlatformAIQuality = lazyWithRetry(f.PlatformAIQuality);
const PlatformEmail = lazyWithRetry(f.PlatformEmail);
const PlatformAudit = lazyWithRetry(f.PlatformAudit);



/**
 * Mapa: id da seção → factory de import. Usado pelo prefetch on-hover
 * (AdminSidebar/MobileAdminLayout chamam `prefetchSection(id)`).
 */
const sectionFactories: Record<string, () => Promise<unknown>> = {
  dashboard: f.AdminDashboard,
  orders: f.OrdersManager,
  certificates: f.CertificatesManager,
  inbox: f.InboxManager,
  agents: f.AgentsManager,
  capture: f.CaptureManager,
  notifications: f.NotificationManager,
  'custom-fields': f.CustomFieldsManager,
  integrations: f.IntegrationsManager,
  connections: f.EvolutionInstancesPanel,
  tags: f.TagsManager,
  schedules: f.BusinessHoursManager,
  // Seções de Plataforma (antiga tela Super Admin).
  'platform-whatsapp': f.PlatformWhatsApp,
  'platform-agent-tools': f.PlatformAgentTools,
  'platform-ai-quality': f.PlatformAIQuality,
  'platform-email': f.PlatformEmail,
  'platform-audit': f.PlatformAudit,
};

export function prefetchAdminSection(id: string) {
  const factory = sectionFactories[id];
  if (factory) prefetch(factory);
}

export default function Admin({ initialSection }: { initialSection?: string } = {}) {
  const isMobile = useIsMobile();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const initialTab = initialSection || tabFromUrl || 'dashboard';
  const [activeSection, setActiveSection] = useState(initialTab);
  const [, startTransition] = useTransition();

  // Sync initialSection prop change (ex: when switching route between Cursos and Blog)
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
      visitedRef.current.add(initialSection);
    }
  }, [initialSection]);

  // Cache de seções já visitadas — mantemos elas montadas (apenas escondidas)
  // para que a 2ª visita seja instantânea.
  const visitedRef = useRef<Set<string>>(new Set([activeSection]));
  visitedRef.current.add(activeSection);

  const navigateToIntegrations = useCallback(
    (_integrationId: string | null) => {
      visitedRef.current.add('integrations');
      startTransition(() => setActiveSection('integrations'));
    },
    [startTransition],
  );

  // Sincroniza tab da URL → estado (permite navegação programática via ?tab=plan)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeSection) {
      setActiveSection(tab);
      visitedRef.current.add(tab);
    }
  }, [searchParams, activeSection]);

  // Deep link legado (sessionStorage) — preferir ?tab=inbox&engagement=1 na URL
  useEffect(() => {
    const section = consumeAdminNavSection();
    if (section) {
      visitedRef.current.add(section);
      setActiveSection(section);
    }
  }, []);

  // Prefetch agressivo: assim que o app carrega, baixamos no idle todas as
  // seções principais. O usuário sente "clicou, abriu".
  useEffect(() => {
    onIdle(() => {
      Object.values(f).forEach((factory) => prefetch(factory));
    }, 2500);
  }, []);

  const handleSectionChange = useCallback((id: string) => {
    // Garante que o chunk começa a baixar antes da transição (caso ainda
    // não tenha sido prefechado).
    prefetchAdminSection(id);
    // Remove ?tab da URL para que o efeito de sincronização não force
    // o usuário de volta à aba do deep-link (ex.: ?tab=plan vindo de upgrade).
    if (searchParams.has('tab')) {
      const next = new URLSearchParams(searchParams);
      next.delete('tab');
      setSearchParams(next, { replace: true });
    }
    startTransition(() => setActiveSection(id));
  }, [searchParams, setSearchParams]);

  // Renderiza o conteúdo de UMA seção específica.
  const renderSection = (sectionId: string) => {
    const menuItem = allMenuItems.find((i) => i.id === sectionId);
    if (menuItem?.comingSoon) {
      return <ComingSoonSection title={menuItem.label} />;
    }

    switch (sectionId) {
      case 'dashboard': return <AdminDashboard />;
      case 'orders': return <OrdersManager />;
      case 'certificates': return <CertificatesManager />;
      case 'inbox': return <InboxManager />;
      case 'agents': return <AgentsManager />;
      case 'capture': return <CaptureManager />;
      case 'notifications': return <NotificationManager />;
      case 'custom-fields': return <CustomFieldsManager />;
      case 'integrations': return <IntegrationsManager />;
      case 'connections': return <EvolutionInstancesPanel />;
      case 'tags': return <TagsManager />;
      case 'schedules': return <BusinessHoursManager />;
      case 'platform-whatsapp': return <PlatformWhatsApp />;
      case 'platform-agent-tools': return <PlatformAgentTools />;
      case 'platform-ai-quality': return <PlatformAIQuality />;
      case 'platform-email': return <PlatformEmail />;
      case 'platform-audit': return <PlatformAudit />;
      default: return <AdminDashboard />;
    }
  };

  // Renderiza TODAS as seções já visitadas, escondendo as inativas.
  // Resultado: revisitar uma seção é instantâneo (componente segue montado).
  const renderContent = () => (
    <>
      {Array.from(visitedRef.current).map((sectionId) => {
        const isActive = sectionId === activeSection;
        return (
          <div
            key={sectionId}
            hidden={!isActive}
            aria-hidden={!isActive}
            style={!isActive ? { display: 'none' } : undefined}
          >
            <SectionErrorBoundary sectionName={sectionId}>
              {/* fallback={null} = nunca mostra spinner; useTransition mantém
                  a tela anterior visível enquanto o chunk novo baixa. */}
              <Suspense fallback={null}>{renderSection(sectionId)}</Suspense>
            </SectionErrorBoundary>
          </div>
        );
      })}
    </>
  );

  if (isMobile) {
    return (
      <IntegrationSuccessProvider onNavigateToIntegrations={navigateToIntegrations}>
        <MobileAdminLayout
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        >
          <AIRechargeAlert />
          <OnboardingBanner />
          {renderContent()}
        </MobileAdminLayout>
      </IntegrationSuccessProvider>
    );
  }

  return (
    <IntegrationSuccessProvider onNavigateToIntegrations={navigateToIntegrations}>
      <div className="min-h-screen bg-background flex w-full">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden scroll-panel">
          <div className="border-b border-border bg-card/40 backdrop-blur px-6 h-16 flex items-center justify-between sticky top-0 z-30">
            <h1 className="font-semibold text-lg text-foreground capitalize">
              {allMenuItems.find((item) => item.id === activeSection)?.label || activeSection}
            </h1>
            <AIGlobalToggle />
          </div>
          <AIRechargeAlert />
          <OnboardingBanner />
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </IntegrationSuccessProvider>
  );
}
