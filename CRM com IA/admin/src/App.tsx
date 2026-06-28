import { Component, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ForcePasswordChange } from "@/components/auth/ForcePasswordChange";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { usePlatformBranding } from "@/hooks/usePlatformBranding";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

// Lazy load all pages for code splitting
const Login = lazyWithRetry(() => import("./pages/Login"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const AcceptInvite = lazyWithRetry(() => import("./pages/AcceptInvite"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Install = lazyWithRetry(() => import("./pages/Install"));
const PublicForm = lazyWithRetry(() => import("./pages/PublicForm"));
const PublicChat = lazyWithRetry(() => import("./pages/PublicChat"));
const PublicFunnel = lazyWithRetry(() => import("./pages/PublicFunnel"));
const SalesPage = lazyWithRetry(() => import("./pages/SalesPage"));
const WhiteLabelPage = lazyWithRetry(() => import("./pages/WhiteLabelPage"));
const PublicBooking = lazyWithRetry(() => import("./pages/PublicBooking"));
const BookingConfirmation = lazyWithRetry(() => import("./pages/BookingConfirmation"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const Settings = lazyWithRetry(() => import("./pages/Settings"));
const Updates = lazyWithRetry(() => import("./pages/Updates"));
const Unsubscribe = lazyWithRetry(() => import("./pages/Unsubscribe"));
const ForgotPassword = lazyWithRetry(() => import("./pages/ForgotPassword"));
const ResetPassword = lazyWithRetry(() => import("./pages/ResetPassword"));


// Global loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Optimized QueryClient with global cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      // 'online' (default) blocks queries while the browser thinks it is offline,
      // which on mobile can leave the UI stuck on a spinner. 'always' lets the
      // query run and surface a real error/empty state instead.
      networkMode: 'always',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});

// Component to apply platform branding
function PlatformBrandingLoader() {
  usePlatformBranding();
  return null;
}

class RouteErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[RouteErrorBoundary]', error);
  }

  handleReload = () => {
    if ('caches' in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key))).catch(() => {});
    }
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-sm space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-semibold text-foreground">Não foi possível carregar a aplicação</h1>
              <p className="text-sm text-muted-foreground">
                {this.state.error?.message?.includes('dynamically imported') ||
                this.state.error?.message?.includes('Importing a module')
                  ? 'A versão em cache ficou desatualizada após o deploy. Recarregue a página.'
                  : 'Ocorreu um erro ao carregar. Recarregue ou limpe o cache do navegador.'}
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
        <PlatformBrandingLoader />
        <ForcePasswordChange />
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || "/"}>
          <RouteErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/aceitar-convite" element={<AcceptInvite />} />
              <Route path="/install" element={<Install />} />
              <Route path="/f/:slug" element={<PublicForm />} />
              <Route path="/c/:slug" element={<PublicChat />} />
              <Route path="/s/:slug" element={<PublicFunnel />} />
              <Route path="/agendar/:userSlug" element={<PublicBooking />} />
              <Route path="/agendar/:userSlug/:eventSlug" element={<PublicBooking />} />
              <Route path="/confirmar/:token" element={<BookingConfirmation />} />
              <Route path="/vendas" element={<SalesPage />} />
              <Route path="/whitelabel" element={<WhiteLabelPage />} />
              <Route path="/reagendar/:token" element={<BookingConfirmation />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              {/* Single-tenant: tela única na raiz (servida em /admin/ pelo base do Vite).
                  A antiga tela do vendedor (Index) foi aposentada. */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              {/* PWA / atalhos antigos podem abrir em /index ou /home — redireciona */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route
                path="/novidades"
                element={<ProtectedRoute><Updates /></ProtectedRoute>}
              />
              {/* Compat: a tela única agora é a raiz. Links/PWA antigos para
                  /admin (que viravam /admin/admin) redirecionam para a raiz. */}
              <Route path="/admin" element={<Navigate to="/" replace />} />
              <Route 
                path="/perfil" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/configuracoes" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              {/* Single-tenant: Super Admin foi absorvido pela tela única (raiz). */}
              <Route path="/super-admin" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
        </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
