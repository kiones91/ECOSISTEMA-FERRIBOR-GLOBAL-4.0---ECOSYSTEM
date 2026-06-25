import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';
import { notifyIntegrationSuccess } from '@/lib/integrationSuccessNotify';

type SmtpSettings = {
  host?: string | null;
  port?: number | null;
  username?: string | null;
  password?: string | null;
  from_email?: string | null;
  from_name?: string | null;
  secure?: 'ssl' | 'starttls' | 'none' | null;
  enabled?: boolean;
};

const PRESETS = [
  { id: 'gmail', label: 'Gmail / Google Workspace', host: 'smtp.gmail.com', port: 587, secure: 'starttls' as const },
  { id: 'outlook', label: 'Outlook / Microsoft 365', host: 'smtp.office365.com', port: 587, secure: 'starttls' as const },
  { id: 'zoho', label: 'Zoho Mail', host: 'smtp.zoho.com', port: 587, secure: 'starttls' as const },
  { id: 'zoho-pro', label: 'Zoho Mail (domínio próprio)', host: 'smtppro.zoho.com', port: 465, secure: 'ssl' as const },
  { id: 'hostinger', label: 'Hostinger', host: 'smtp.hostinger.com', port: 465, secure: 'ssl' as const },
  { id: 'locaweb', label: 'Locaweb', host: 'email-ssl.com.br', port: 465, secure: 'ssl' as const },
];

export function SmtpCustomConfigManager() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id ?? null;
  const qc = useQueryClient();

  const { data: settingsRow, isLoading } = useQuery({
    queryKey: ['smtp-custom-settings', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('settings, is_configured')
        .eq('organization_id', orgId!)
        .eq('integration_type', 'smtp_custom')
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const settings = (settingsRow?.settings ?? {}) as SmtpSettings;

  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [fromName, setFromName] = useState('');
  const [secure, setSecure] = useState<'ssl' | 'starttls' | 'none'>('starttls');
  const [enabled, setEnabled] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [testEmail, setTestEmail] = useState(profile?.email ?? '');

  useEffect(() => {
    setHost(settings.host ?? '');
    setPort(String(settings.port ?? 587));
    setUsername(settings.username ?? '');
    setPassword(settings.password ?? '');
    setFromEmail(settings.from_email ?? '');
    setFromName(settings.from_name ?? '');
    setSecure(settings.secure ?? 'starttls');
    setEnabled(settings.enabled !== false);
  }, [settingsRow]);

  const isConfigured = !!(
    settingsRow?.is_configured &&
    settings.host &&
    settings.username &&
    settings.from_email
  );

  const saveSettings = useMutation({
    mutationFn: async () => {
      if (!orgId) throw new Error('Organização não identificada');
      const merged: SmtpSettings = {
        host: host.trim() || null,
        port: Number(port) || 587,
        username: username.trim() || null,
        password: password.trim() || settings.password || null,
        from_email: fromEmail.trim() || null,
        from_name: fromName.trim() || null,
        secure,
        enabled,
      };
      const ready = !!(
        merged.enabled &&
        merged.host &&
        merged.username &&
        merged.password &&
        merged.from_email
      );
      const { error } = await supabase.from('integration_settings').upsert(
        {
          organization_id: orgId,
          integration_type: 'smtp_custom',
          settings: merged as any,
          is_configured: ready,
          last_verified_at: new Date().toISOString(),
        },
        { onConflict: 'organization_id,integration_type' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['smtp-custom-settings', orgId] });
      qc.invalidateQueries({ queryKey: ['all-integration-settings', orgId] });
      notifyIntegrationSuccess('smtp-custom');
      toast.success('SMTP salvo');
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendTest = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('smtp-send-test', {
        body: { testEmail: testEmail.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => toast.success('E-mail de teste enviado! Verifique a caixa de entrada.'),
    onError: (e: Error) => toast.error(e.message ?? 'Falha no teste SMTP'),
  });

  const applyPreset = (presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setHost(p.host);
    setPort(String(p.port));
    setSecure(p.secure);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2 flex-wrap">
          SMTP Customizado
          {isConfigured ? (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Ativo
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" /> Pendente
            </Badge>
          )}
        </h3>
        <p className="text-sm text-muted-foreground">
          Envie campanhas, pós-venda e automações pelo seu servidor de e-mail
        </p>
      </div>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Quando o SMTP está ativo</AlertTitle>
        <AlertDescription className="text-sm">
          E-mails em massa, templates de pós-venda e mensagens automáticas usam este servidor.
          Se o envio falhar, o sistema tenta o canal padrão da plataforma (Resend).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Servidor SMTP</CardTitle>
          <CardDescription>Escolha um preset ou preencha manualmente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Preset rápido</Label>
            <Select onValueChange={applyPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar provedor..." />
              </SelectTrigger>
              <SelectContent>
                {PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Host</Label>
              <Input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtp.seudominio.com"
                autoComplete="off"
                name="smtp-host"
              />
            </div>
            <div className="space-y-2">
              <Label>Porta</Label>
              <Input
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="587"
                type="number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Segurança</Label>
            <Select value={secure} onValueChange={(v) => setSecure(v as typeof secure)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starttls">STARTTLS (porta 587)</SelectItem>
                <SelectItem value="ssl">SSL/TLS (porta 465)</SelectItem>
                <SelectItem value="none">Sem criptografia (não recomendado)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="usuario@suaempresa.com"
                autoComplete="off"
                name="smtp-user"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <div className="flex gap-2">
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={settings.password ? '••••••••' : 'Senha do e-mail'}
                  autoComplete="new-password"
                  name="smtp-password"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>E-mail remetente (From)</Label>
              <Input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="vendas@suaempresa.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Nome remetente</Label>
              <Input
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Equipe Comercial"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="smtp-enabled"
              checked={enabled}
              onCheckedChange={(v) => setEnabled(!!v)}
            />
            <Label htmlFor="smtp-enabled" className="font-normal cursor-pointer">
              Usar SMTP para envios desta organização
            </Label>
          </div>

          <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
            {saveSettings.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Salvar SMTP
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Testar envio</CardTitle>
          <CardDescription>Salve antes e envie um e-mail de teste</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label>Enviar teste para</Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => sendTest.mutate()}
            disabled={sendTest.isPending || !isConfigured}
          >
            {sendTest.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar teste
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
