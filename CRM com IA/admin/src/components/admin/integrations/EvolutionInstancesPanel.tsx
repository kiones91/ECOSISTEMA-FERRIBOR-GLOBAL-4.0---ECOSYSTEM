import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Smartphone, Star, Loader2, QrCode, CheckCircle2, Pause, LogOut, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  useEvolutionInstances,
  useSetDefaultEvolutionInstance,
  useConnectEvolutionInstance,
  syncEvolutionInstanceStatus,
  useDisconnectEvolutionInstance,
  useLogoutEvolutionInstance,
  useCreateEvolutionInstanceSelf,
  useDeleteEvolutionInstanceSelf,
  useRenameEvolutionInstanceSelf,
  type EvolutionInstance,
} from '@/hooks/useEvolutionInstances';
import { useAuth } from '@/hooks/useAuth';
import { useOrganizationEffectivePlan } from '@/hooks/useOrganizationPlan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notifyIntegrationSuccess } from '@/lib/integrationSuccessNotify';
import { PresenceTestButton } from './PresenceTestButton';


function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'connected' || status === 'paired';

  if (isActive) {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400"
      >
        Conectado
      </Badge>
    );
  }

  if (status === 'qr_pending') {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400"
      >
        Aguardando QR
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-destructive/10 text-destructive border-destructive/30"
    >
      Desconectado
    </Badge>
  );
}

function instanceIconClass(status: string): string {
  const isActive = status === 'connected' || status === 'paired';
  if (isActive) return 'bg-green-500/10 text-green-500';
  if (status === 'qr_pending') return 'bg-amber-500/10 text-amber-600';
  return 'bg-destructive/10 text-destructive';
}

function ConnectDialog({ instance, onClose }: { instance: EvolutionInstance; onClose: () => void }) {
  const connectMut = useConnectEvolutionInstance();
  const [qr, setQr] = useState<string | null>(instance.qr_code);
  const [status, setStatus] = useState(instance.status);
  const [elapsed, setElapsed] = useState(0);

  const triggerConnect = () => {
    setQr(null);
    setElapsed(0);
    connectMut.mutate(instance.id, {
      onSuccess: (data: any) => {
        if (data?.already_connected) {
          setStatus('connected');
          toast.success(data?.reconnected ? 'Sessão reconectada!' : 'Já conectado!');
          setTimeout(onClose, 1200);
          return;
        }
        if (data?.qr_code) setQr(data.qr_code);
      },
    });
  };

  useEffect(() => {
    triggerConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll DB for QR/status updates pushed by webhook + sync live status from Evolution GO
  useEffect(() => {
    if (status === 'connected' || status === 'paired') return;
    const interval = setInterval(async () => {
      try {
        await syncEvolutionInstanceStatus(instance.id);
      } catch {
        /* best-effort */
      }
      const { data } = await supabase
        .from('evolution_instances')
        .select('status, qr_code')
        .eq('id', instance.id)
        .maybeSingle();
      if (data) {
        if (data.qr_code && data.qr_code !== qr) setQr(data.qr_code);
        if (data.status !== status) {
          setStatus(data.status);
          if (data.status === 'connected' || data.status === 'paired') {
            notifyIntegrationSuccess('whatsapp', { skipOpenDrawer: true });
            setTimeout(onClose, 1500);
          }
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [status, qr, instance.id, onClose]);

  // Elapsed timer (used to decide "loading" vs "error" state)
  useEffect(() => {
    if (qr || status === 'connected') return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [qr, status]);

  const isQrBase64 = qr?.startsWith('data:image') || qr?.startsWith('iVBOR');
  const showError = !qr && status !== 'connected' && elapsed >= 45;
  const showLoading = !qr && status !== 'connected' && !showError;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar {instance.name}</DialogTitle>
          <DialogDescription>
            Abra o WhatsApp no celular → Configurações → Aparelhos conectados → Conectar aparelho → escaneie o código abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-6 min-h-[280px]">
          {status === 'connected' ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <p className="font-medium">Conectado!</p>
            </div>
          ) : qr ? (
            <div className="bg-white p-3 rounded-lg">
              <img
                src={isQrBase64 ? (qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`) : `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qr)}`}
                alt="QR Code"
                className="w-60 h-60"
              />
            </div>
          ) : showLoading ? (
            <div className="text-center space-y-3">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                {elapsed < 10 ? 'Gerando QR Code…' : 'Ainda aguardando o servidor gerar o QR…'}
              </p>
              <p className="text-xs text-muted-foreground">
                Isso pode levar até 45 segundos. Mantenha esta janela aberta.
              </p>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Não foi possível gerar o QR Code.</p>
              <Button size="sm" variant="outline" onClick={triggerConnect} disabled={connectMut.isPending}>
                {connectMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tentar novamente'}
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Status: <StatusBadge status={status} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateInstanceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const createMut = useCreateEvolutionInstanceSelf();

  const sanitized = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
  const valid = /^[a-z0-9-]{3,40}$/.test(sanitized);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createMut.mutate({ name: sanitized }, { onSuccess: () => { setName(''); onClose(); } });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setName(''); onClose(); } }}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nova conexão de WhatsApp</DialogTitle>
            <DialogDescription>
              Dê um nome simples para identificar essa conexão (ex: <code>vendas</code>, <code>atendimento</code>).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="instance-name">Nome da conexão</Label>
            <Input
              id="instance-name"
              autoFocus
              placeholder="ex: vendas-01"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createMut.isPending}
            />
            <p className="text-xs text-muted-foreground">
              Apenas letras minúsculas, números e hífens. Mínimo 3 caracteres.
            </p>
            {name && !valid && (
              <p className="text-xs text-destructive">
                Nome inválido. Use apenas letras minúsculas, números e hífens (3 a 40 caracteres).
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createMut.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid || createMut.isPending}>
              {createMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar conexão
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameDialog({ instance, onClose }: { instance: EvolutionInstance; onClose: () => void }) {
  const initial = (instance.metadata as any)?.display_name || instance.name;
  const [name, setName] = useState<string>(initial);
  const renameMut = useRenameEvolutionInstanceSelf();

  const valid = name.trim().length >= 2 && name.trim().length <= 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    renameMut.mutate({ id: instance.id, name: name.trim() }, { onSuccess: () => onClose() });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Renomear conexão</DialogTitle>
            <DialogDescription>
              Atualize o nome de exibição desta conexão. O identificador interno permanece o mesmo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="rename-instance">Nome de exibição</Label>
            <Input
              id="rename-instance"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={renameMut.isPending}
            />
            <p className="text-xs text-muted-foreground">Entre 2 e 60 caracteres.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={renameMut.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!valid || renameMut.isPending}>
              {renameMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EvolutionInstancesPanel() {
  const queryClient = useQueryClient();
  const { data: instances, isLoading } = useEvolutionInstances();
  const setDefaultMut = useSetDefaultEvolutionInstance();
  const disconnectMut = useDisconnectEvolutionInstance();
  const logoutMut = useLogoutEvolutionInstance();
  const deleteMut = useDeleteEvolutionInstanceSelf();
  const [connecting, setConnecting] = useState<EvolutionInstance | null>(null);
  const [pausing, setPausing] = useState<EvolutionInstance | null>(null);
  const [unlinking, setUnlinking] = useState<EvolutionInstance | null>(null);
  const [renaming, setRenaming] = useState<EvolutionInstance | null>(null);
  const [deleting, setDeleting] = useState<EvolutionInstance | null>(null);
  const [creating, setCreating] = useState(false);

  const displayName = (inst: EvolutionInstance) =>
    (inst.metadata as any)?.display_name || inst.name;

  const isLinked = (s: string) => s === 'connected' || s === 'paired';

  // Single-tenant: conexões de WhatsApp ilimitadas (sem teto de plano).

  // Sincroniza status com Evolution GO (GET /instance/status) e atualiza a lista
  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      try {
        await syncEvolutionInstanceStatus();
      } catch {
        /* polling silencioso */
      }
      if (!cancelled) {
        queryClient.invalidateQueries({ queryKey: ['evolution-instances'] });
      }
    };

    sync();
    const interval = setInterval(sync, 8000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [queryClient]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">Suas Instâncias de WhatsApp</h3>
          <p className="text-sm text-muted-foreground">
            Conecte seus números de WhatsApp escaneando o QR Code com o aparelho.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova conexão
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !instances?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Nenhuma conexão criada ainda.</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Clique em <strong>Nova conexão</strong> para criar sua primeira instância de WhatsApp.
            </p>
          </CardContent>
        </Card>

      ) : (
        <div className="grid gap-3">
          {instances.map((inst) => (
            <Card key={inst.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${instanceIconClass(inst.status)}`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium truncate">{displayName(inst)}</p>
                        {inst.is_default && (
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" /> Padrão
                          </Badge>
                        )}
                        <StatusBadge status={inst.status} />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {isLinked(inst.status) && inst.phone_number
                          ? `+${inst.phone_number}`
                          : inst.status === 'qr_pending'
                            ? 'Escaneie o QR Code para ativar'
                            : 'Não conectado'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => setConnecting(inst)}
                      disabled={isLinked(inst.status)}
                      title={
                        isLinked(inst.status)
                          ? 'WhatsApp já conectado — use Pausar ou Desvincular para alterar a sessão'
                          : 'Gerar QR Code e conectar'
                      }
                      className={isLinked(inst.status) ? 'opacity-50 cursor-not-allowed' : undefined}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Conectar
                    </Button>
                    {isLinked(inst.status) && (
                      <>
                        <PresenceTestButton instanceId={inst.id} instanceName={displayName(inst)} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPausing(inst)}
                          title="Pausar sessão (mantém o número pareado)"
                        >
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUnlinking(inst)}
                          className="text-destructive hover:text-destructive"
                          title="Desvincular número (exige novo QR)"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Desvincular
                        </Button>
                      </>
                    )}
                    {!inst.is_default && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDefaultMut.mutate(inst.id)}
                        disabled={setDefaultMut.isPending}
                        title="Definir como padrão"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRenaming(inst)}
                      title="Editar nome"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleting(inst)}
                      className="text-destructive hover:text-destructive"
                      title="Excluir conexão"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {connecting && (
        <ConnectDialog instance={connecting} onClose={() => setConnecting(null)} />
      )}

      {/* Pausar sessão */}
      <AlertDialog open={!!pausing} onOpenChange={(o) => !o && setPausing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pausar a sessão?</AlertDialogTitle>
            <AlertDialogDescription>
              O pareamento com o número{' '}
              <strong>{pausing?.phone_number ? `+${pausing.phone_number}` : 'atual'}</strong>{' '}
              é mantido. Ao clicar em <strong>Conectar</strong> novamente, a sessão volta automaticamente
              sem precisar de novo QR Code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pausing) disconnectMut.mutate(pausing.id);
                setPausing(null);
              }}
              disabled={disconnectMut.isPending}
            >
              {disconnectMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Pausar sessão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desvincular número */}
      <AlertDialog open={!!unlinking} onOpenChange={(o) => !o && setUnlinking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desvincular este WhatsApp?</AlertDialogTitle>
            <AlertDialogDescription>
              O número{' '}
              <strong>{unlinking?.phone_number ? `+${unlinking.phone_number}` : 'atual'}</strong>{' '}
              será removido desta instância e desaparecerá da lista de "Aparelhos conectados" no celular.
              Para reconectar (este ou outro número) será necessário escanear um novo QR Code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (unlinking) logoutMut.mutate(unlinking.id);
                setUnlinking(null);
              }}
              disabled={logoutMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {logoutMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Desvincular número
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excluir conexão (apaga local + Evolution Go) */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir esta conexão?</AlertDialogTitle>
            <AlertDialogDescription>
              A conexão <strong>{deleting ? displayName(deleting) : ''}</strong> será removida
              permanentemente, junto com a instância no servidor Evolution Go. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) deleteMut.mutate(deleting.id);
                setDeleting(null);
              }}
              disabled={deleteMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir conexão
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {renaming && <RenameDialog instance={renaming} onClose={() => setRenaming(null)} />}

      <CreateInstanceDialog open={creating} onClose={() => setCreating(false)} />
    </div>
  );
}
