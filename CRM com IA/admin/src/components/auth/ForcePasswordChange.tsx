import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function ForcePasswordChange() {
  const { user, profile } = useAuth();
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [loading, setLoading] = useState(false);

  const open = !!user && !!profile && (profile as any).must_change_password === true;

  const handleSave = async () => {
    if (pwd.length < 6) return toast.error('Mínimo de 6 caracteres');
    if (pwd !== pwd2) return toast.error('As senhas não coincidem');
    if (pwd === '#mude123') return toast.error('Escolha uma senha diferente da provisória');

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
      await supabase.from('profiles').update({ must_change_password: false }).eq('id', user!.id);
      toast.success('Senha atualizada! Recarregando…');
      setTimeout(() => window.location.reload(), 600);
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Defina sua nova senha</DialogTitle>
          <DialogDescription>
            Por segurança, você precisa trocar a senha provisória antes de continuar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nova senha</Label>
            <PasswordInput value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Confirmar nova senha</Label>
            <PasswordInput value={pwd2} onChange={(e) => setPwd2(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar nova senha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
