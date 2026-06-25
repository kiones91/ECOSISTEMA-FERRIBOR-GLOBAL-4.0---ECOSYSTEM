import { useState } from 'react';
import {
  Mail,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Pencil,
  KeyRound,
  CreditCard,
  Bell,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePlatformEmailSettings, useUpdatePlatformEmailSettings, useCreateAuditLog } from '@/hooks/useSuperAdmin';
import { usePlatformTemplates, type PlatformEmailTemplate } from '@/hooks/usePlatformTemplates';
import { PlatformTemplateEditor } from './PlatformTemplateEditor';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { BRAND } from '@/config/brand';
import {
  ClientEmailTrace,
  errorMessageFromInvokeBody,
  formatEmailTrace,
  parseInvokeErrorBody,
  parseTraceFromResponse,
  type EmailTraceResult,
} from '@/lib/emailTrace';

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<any>; color: string }> = {
  acesso: { label: 'Acesso & Convites', icon: KeyRound, color: 'text-blue-500' },
  cobranca: { label: 'Cobrança', icon: CreditCard, color: 'text-amber-500' },
  sistema: { label: 'Sistema', icon: Bell, color: 'text-primary' },
  mala_direta: { label: 'Mala Direta', icon: Megaphone, color: 'text-purple-500' },
};

export function EmailSettings() {
  const { data: settings, isLoading } = usePlatformEmailSettings();
  const { data: templates, isLoading: loadingTemplates } = usePlatformTemplates();
  const updateSettings = useUpdatePlatformEmailSettings();
  const createAuditLog = useCreateAuditLog();

  const [editing, setEditing] = useState<PlatformEmailTemplate | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [lastTrace, setLastTrace] = useState<EmailTraceResult | null>(null);

  const automation = {
    reminder_days_before: settings?.reminder_days_before ?? 3,
    reminder_on_due_date: settings?.reminder_on_due_date ?? true,
    alert_days_after: settings?.alert_days_after ?? 3,
    suspend_days_after: settings?.suspend_days_after ?? 15,
  };

  const saveAutomation = async (patch: Partial<typeof automation>) => {
    try {
      await updateSettings.mutateAsync({ ...automation, ...patch });
      await createAuditLog.mutateAsync({
        action: 'Automação de e-mail atualizada',
        entity_type: 'platform_email_settings',
      });
      toast.success('Automação salva');
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const handleTestEmail = async (mode: 'generic' | 'welcome' = 'generic') => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Informe um e-mail válido');
      return;
    }
    setTesting(true);
    const clientTrace = new ClientEmailTrace('crm-email-test');
    clientTrace.ok('CRM-01', 'Chamando test-integration', testEmail);

    try {
      const { data, error } = await supabase.functions.invoke('test-integration', {
        body: {
          type: mode === 'welcome' ? 'welcome_email' : 'email',
          email: testEmail,
        },
      });

      const responseBody = await parseInvokeErrorBody(error, data);
      clientTrace.mergeServer(parseTraceFromResponse(responseBody));

      if (error) {
        const serverMsg = errorMessageFromInvokeBody(responseBody, error.message);
        clientTrace.fail('CRM-02', 'Resposta da Edge Function', serverMsg || error.message);
        setLastTrace(clientTrace.toJSON());
        throw new Error(serverMsg || error.message);
      }

      clientTrace.ok('CRM-02', 'Resposta recebida');

      if (data && data.success === false) {
        clientTrace.fail('CRM-02', 'Envio confirmado', data.message || data.error || 'Falha');
        setLastTrace(clientTrace.toJSON());
        throw new Error(data.message || data.error || 'Falha no envio');
      }

      clientTrace.ok('CRM-03', 'Pipeline completo ✓');
      setLastTrace(clientTrace.toJSON());
      toast.success(data?.message || `E-mail de teste enviado para ${testEmail}`);
    } catch (e: unknown) {
      const finalTrace = clientTrace.toJSON();
      setLastTrace(finalTrace);
      const msg = e instanceof Error ? e.message : 'Falha ao enviar e-mail de teste';
      toast.error(msg, {
        description: finalTrace.failed_at
          ? `Parou em: ${finalTrace.failed_at} — veja rastro abaixo`
          : 'Veja o rastro de etapas abaixo',
        duration: 8000,
      });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const templatesByCategory = (templates ?? []).reduce<Record<string, PlatformEmailTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  const totalTemplates = templates?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações de E-mail</h1>
          <p className="text-muted-foreground">Provedor, templates e automações de e-mail da plataforma</p>
        </div>
      </div>

      <Tabs defaultValue="provider" className="space-y-6">
        <TabsList>
          <TabsTrigger value="provider">Provedor</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automações</TabsTrigger>
        </TabsList>

        {/* Provider */}
        <TabsContent value="provider">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Resend — E-mail transacional
              </CardTitle>
              <CardDescription>
                Envio de convites, boas-vindas e notificações da {BRAND.platformName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Provedor Resend</p>
                  <p className="text-sm text-muted-foreground">
                    Configure a chave <code className="text-xs bg-muted px-1 rounded">RESEND_API_KEY</code> nos
                    secrets do Supabase e verifique seu domínio no Resend. O remetente de suporte fica em{' '}
                    <strong>Identidade Visual → Informações Gerais</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Checklist de ativação</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Domínio verificado no Resend (DKIM/SPF)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Secret RESEND_API_KEY no Supabase</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> E-mail de suporte em Informações Gerais</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Teste de envio abaixo</li>
                </ul>
                <Button variant="link" className="h-auto p-0 text-primary" asChild>
                  <a href={BRAND.resendDocsUrl} target="_blank" rel="noreferrer">
                    Abrir documentação Resend
                  </a>
                </Button>
              </div>

              <div className="border-t border-border pt-6 space-y-2">
                <p className="text-sm font-medium">Enviar e-mail de teste</p>
                <div className="flex gap-2 flex-wrap">
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button onClick={() => handleTestEmail('generic')} disabled={testing} variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    {testing ? 'Enviando...' : 'Teste simples'}
                  </Button>
                  <Button onClick={() => handleTestEmail('welcome')} disabled={testing}>
                    <Send className="h-4 w-4 mr-2" />
                    {testing ? 'Enviando...' : 'Teste boas-vindas'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use &quot;Teste boas-vindas&quot; para simular o e-mail enviado ao cadastrar um novo membro.
                </p>

                {lastTrace && (
                  <div
                    className={`mt-3 rounded-lg border p-3 text-xs font-mono whitespace-pre-wrap ${
                      lastTrace.success
                        ? 'border-green-500/30 bg-green-500/5 text-green-800 dark:text-green-300'
                        : 'border-destructive/30 bg-destructive/5 text-destructive'
                    }`}
                  >
                    <p className="font-sans font-medium text-sm mb-2 text-foreground">
                      Rastro do pipeline {lastTrace.success ? '(sucesso)' : `(falhou em ${lastTrace.failed_at})`}
                    </p>
                    {formatEmailTrace(lastTrace)}
                    <p className="font-sans text-muted-foreground mt-2 text-[11px]">
                      Documentação: docs/EMAIL_TRANSACIONAL_ARQUITETURA.md
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4">
          {loadingTemplates ? (
            <Skeleton className="h-[400px] w-full" />
          ) : totalTemplates === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nenhum template cadastrado</CardTitle>
                <CardDescription>
                  No banco ainda não há registros em <code className="text-xs bg-muted px-1 rounded">platform_email_templates</code>.
                  Execute no Supabase SQL Editor o arquivo{' '}
                  <code className="text-xs bg-muted px-1 rounded">supabase/migrations/20260604150000_platform_assets_and_email_templates.sql</code>{' '}
                  (ou a migration completa <code className="text-xs bg-muted px-1 rounded">20260430175058</code>) e recarregue esta página.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Recarregar lista
                </Button>
              </CardContent>
            </Card>
          ) : (
            Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const items = templatesByCategory[cat] ?? [];
              if (items.length === 0) return null;
              const Icon = meta.icon;
              return (
                <Card key={cat}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                      {meta.label}
                      <Badge variant="outline" className="ml-2">{items.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((tpl) => (
                        <div
                          key={tpl.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm truncate">{tpl.name}</p>
                                {!tpl.is_active && (
                                  <Badge variant="secondary" className="text-xs">Inativo</Badge>
                                )}
                                {tpl.is_system && (
                                  <Badge variant="outline" className="text-xs">Sistema</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {tpl.description ?? tpl.subject}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditing(tpl)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-2" />
                            Editar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Automation */}
        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle>Automações de Cobrança</CardTitle>
              <CardDescription>Quando os e-mails automáticos serão disparados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Lembrete antes do vencimento</p>
                    <p className="text-sm text-muted-foreground">
                      Enviar lembrete {automation.reminder_days_before} dias antes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    defaultValue={automation.reminder_days_before}
                    onBlur={(e) => saveAutomation({ reminder_days_before: parseInt(e.target.value) })}
                    className="w-20"
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Cobrança no dia do vencimento</p>
                    <p className="text-sm text-muted-foreground">Enviar e-mail no dia D</p>
                  </div>
                </div>
                <Switch
                  checked={automation.reminder_on_due_date}
                  onCheckedChange={(c) => saveAutomation({ reminder_on_due_date: c })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium">Alerta de atraso</p>
                    <p className="text-sm text-muted-foreground">
                      Após {automation.alert_days_after} dias de atraso
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    defaultValue={automation.alert_days_after}
                    onBlur={(e) => saveAutomation({ alert_days_after: parseInt(e.target.value) })}
                    className="w-20"
                    min={1}
                    max={30}
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Suspensão automática</p>
                    <p className="text-sm text-muted-foreground">
                      Suspender após {automation.suspend_days_after} dias de atraso
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    defaultValue={automation.suspend_days_after}
                    onBlur={(e) => saveAutomation({ suspend_days_after: parseInt(e.target.value) })}
                    className="w-20"
                    min={1}
                    max={90}
                  />
                  <span className="text-sm text-muted-foreground">dias</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PlatformTemplateEditor
        template={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </div>
  );
}
