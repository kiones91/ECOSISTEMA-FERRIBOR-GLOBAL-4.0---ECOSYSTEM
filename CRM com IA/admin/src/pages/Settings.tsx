import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useUpdatePassword } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Lock, 
  Shield, 
  Link2, 
  Bell, 
  Loader2, 
  Calendar,
  CheckCircle2,
  Eye, 
  EyeOff,
  XCircle,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const updatePassword = useUpdatePassword();

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sound: true,
    dailySummary: true
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    await updatePassword.mutateAsync({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="flex items-center h-full px-6 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
            <p className="text-sm text-muted-foreground">Gerencie sua conta e preferências</p>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto py-8 px-4">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account" className="gap-2">
              <Lock size={16} className="hidden sm:block" />
              Conta
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield size={16} className="hidden sm:block" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 size={16} className="hidden sm:block" />
              Integrações
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell size={16} className="hidden sm:block" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock size={20} />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso à plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Digite a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Confirme a nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={updatePassword.isPending}>
                      {updatePassword.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Atualizando...
                        </>
                      ) : (
                        'Atualizar Senha'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone size={20} />
                  Autenticação de Dois Fatores (2FA)
                </CardTitle>
                <CardDescription>
                  Adicione uma camada extra de segurança à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Shield size={20} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Status do 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Proteja sua conta com autenticação em dois fatores
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <XCircle size={12} className="text-yellow-500" />
                    Não configurado
                  </Badge>
                </div>

                <div className="p-4 rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    A configuração de 2FA via aplicativo autenticador estará disponível em breve.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sessões Ativas</CardTitle>
                <CardDescription>
                  Dispositivos conectados à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Smartphone size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Sessão Atual</p>
                      <p className="text-sm text-muted-foreground">
                        {navigator.userAgent.includes('Chrome') ? 'Chrome' : 
                         navigator.userAgent.includes('Safari') ? 'Safari' : 
                         navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Navegador'}
                        {' • '}
                        {navigator.platform}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-500 border-0">
                    Ativo agora
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações</CardTitle>
                <CardDescription>
                  Conecte outras ferramentas à sua conta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-lg border border-dashed text-center">
                  <Link2 className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Novas integrações estarão disponíveis em breve
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell size={20} />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Escolha como deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">
                      Receba atualizações importantes por email
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações Push</p>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações no navegador
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sons de Notificação</p>
                    <p className="text-sm text-muted-foreground">
                      Reproduzir som ao receber notificações
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.sound}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, sound: checked }))}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Resumo Diário</p>
                    <p className="text-sm text-muted-foreground">
                      Receba um resumo das atividades do dia
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.dailySummary}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailySummary: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
