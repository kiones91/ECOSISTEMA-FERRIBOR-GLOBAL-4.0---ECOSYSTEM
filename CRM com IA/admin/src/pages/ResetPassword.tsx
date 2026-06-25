import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';
import { Logo } from '@/components/ui/Logo';

type Status = 'checking' | 'ready' | 'invalid' | 'success';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    let cancelled = false;

    // Marcadores possíveis de recovery na URL (fluxo PKCE com ?code= ou hash legacy)
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    const hasRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token=');
    const hasCode = new URLSearchParams(search).has('code');
    const hasRecoveryMarker = hasRecoveryHash || hasCode;

    // PASSWORD_RECOVERY dispara quando o supabase-js processa o link
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === 'PASSWORD_RECOVERY' && session) {
        setStatus('ready');
      } else if (event === 'SIGNED_IN' && session && hasRecoveryMarker) {
        // Em alguns fluxos o evento vem como SIGNED_IN logo após o recovery
        setStatus('ready');
      }
    });

    // Fallback: aguarda processamento da URL e checa a sessão
    const settle = async () => {
      // Pequeno atraso para o supabase-js terminar de processar a URL (detectSessionInUrl)
      await new Promise((r) => setTimeout(r, 400));
      if (cancelled) return;
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session && hasRecoveryMarker) {
        setStatus('ready');
      } else if (data.session && !hasRecoveryMarker) {
        // Usuário logado entrou direto na rota — permite trocar a senha mesmo assim
        setStatus('ready');
      } else if (hasRecoveryMarker) {
        // Tem marcador mas a sessão ainda não foi criada — dá mais um tempo
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) return;
        const second = await supabase.auth.getSession();
        if (cancelled) return;
        setStatus(second.data.session ? 'ready' : 'invalid');
      } else {
        setStatus('invalid');
      }
    };

    settle();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast.error(translateAuthError(error.message));
        setIsLoading(false);
        return;
      }
      setStatus('success');
      toast.success('Senha atualizada com sucesso!');
      await supabase.auth.signOut();
      setTimeout(() => navigate('/login'), 1500);
    } catch {
      toast.error('Ocorreu um erro inesperado');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center">
          <Logo size="lg" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Redefinir senha</h2>
          <p className="text-muted-foreground mt-2">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        {status === 'checking' && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Senha atualizada! Redirecionando para o login...
            </p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <p className="text-sm text-foreground">
              Link inválido ou expirado. Solicite um novo link de redefinição.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Solicitar novo link
            </Button>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <PasswordInput
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Atualizar senha'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
