import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';
import { Logo } from '@/components/ui/Logo';
import { usePlatformName } from '@/hooks/usePlatformName';
import { getPostLoginPath } from '@/lib/postLoginRoute';

async function navigateAfterAuth(navigate: ReturnType<typeof useNavigate>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    navigate('/login');
    return;
  }
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  navigate(getPostLoginPath(roles ?? []));
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const { signIn, signUp, user, roles, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { platformName, loginHeadline, loginSubheadline, loginStatsEnabled, footerText, loginBgImageUrl, loginBgLayout } = usePlatformName();

  // Sessão ativa (ex.: retorno do Google OAuth) → painel correto por papel
  useEffect(() => {
    if (authLoading || !user) return;
    navigate(getPostLoginPath(roles), { replace: true });
  }, [authLoading, user, roles, navigate]);

  // Bootstrap idempotente do Super Admin padrão (no remix novo).
  // A edge function é autobloqueante — após criar, sempre retorna { status: "locked" }.
  // Guard de sessionStorage evita request repetida em recargas da mesma sessão.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('buffallos_bootstrap_attempted') === '1') return;
    sessionStorage.setItem('buffallos_bootstrap_attempted', '1');
    supabase.functions.invoke('ensure-default-super-admin').catch(() => {
      // silencioso — não atrapalha login
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(translateAuthError(error.message));
        } else {
          toast.success('Bem-vindo de volta!');
          await navigateAfterAuth(navigate);
        }
      } else {
        if (!fullName.trim()) {
          toast.error('Digite seu nome completo');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(translateAuthError(error.message));
        } else {
          toast.success('Conta criada com sucesso!');
          await navigateAfterAuth(navigate);
        }
      }
    } catch (error) {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (error) {
        toast.error(translateAuthError(error.message));
      }
    } catch {
      toast.error('Ocorreu um erro inesperado');
    } finally {
      setIsGoogleLoading(false);
    }
  };


  // Processar headline com quebra de linha
  const headlineParts = loginHeadline.split('\n');

  const layout = loginBgImageUrl ? loginBgLayout : 'split-left';
  const isFullscreen = layout === 'fullscreen';
  const isSplitRight = layout === 'split-right';

  return (
    <div
      className={`min-h-screen bg-background flex relative ${
        isSplitRight ? 'lg:flex-row-reverse' : ''
      }`}
      style={
        isFullscreen && loginBgImageUrl
          ? {
              backgroundImage: `url(${loginBgImageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundColor: 'hsl(var(--primary))',
            }
          : undefined
      }
    >
      {/* Overlay quando imagem ocupa a tela toda, garante legibilidade do form */}
      {isFullscreen && loginBgImageUrl && (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm pointer-events-none" />
      )}

      {/* No mobile, mostra a imagem como fundo + overlay para legibilidade do form */}
      {!isFullscreen && loginBgImageUrl && (
        <>
          <div
            className="lg:hidden absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url(${loginBgImageUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="lg:hidden absolute inset-0 bg-background/85 backdrop-blur-sm pointer-events-none" />
        </>
      )}

      {/* Branding lateral — oculto em layout fullscreen */}
      {!isFullscreen && (
        <div
          className="hidden lg:flex lg:w-1/2 flex-col justify-between relative overflow-hidden bg-black"
          style={
            loginBgImageUrl
              ? {
                  backgroundImage: `url(${loginBgImageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#000',
                }
              : { background: 'var(--gradient-primary)' }
          }
        />
      )}

      {/* Form — em fullscreen ocupa toda a largura e é centralizado em um card */}
      <div
        className={`w-full ${
          isFullscreen ? '' : 'lg:w-1/2'
        } flex items-center justify-center p-8 relative z-10`}
      >
        <div
          className={`w-full max-w-md space-y-8 ${
            isFullscreen
              ? 'bg-background/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl p-8'
              : ''
          }`}
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-3">
            <Logo size="lg" />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">
              {isLogin ? 'Entrar na conta' : 'Criar nova conta'}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isLogin
                ? 'Entre com suas credenciais para acessar'
                : 'Preencha os dados para começar'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 text-base gap-3"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </>
            )}
          </Button>


          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                ou continue com email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 bg-card border-border"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-card border-border"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {isLogin && (
                  <Link
                    to="/forgot-password"
                    className="text-xs text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </Link>
                )}
              </div>
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

            <Button 
              type="submit" 
              className="w-full h-12 text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Criar conta'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline text-sm"
            >
              {isLogin 
                ? 'Não tem conta? Criar agora'
                : 'Já tem conta? Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
