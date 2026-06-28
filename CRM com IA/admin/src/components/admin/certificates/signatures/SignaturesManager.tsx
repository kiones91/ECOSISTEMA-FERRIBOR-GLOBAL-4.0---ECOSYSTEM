import { useState, useRef, useEffect } from 'react';
import { useDigitalSignatures, useCreateSignature, useDeleteSignature } from '@/hooks/useDigitalSignatures';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PenTool, Trash2, Plus, Upload, Eraser } from 'lucide-react';

export function SignaturesManager() {
  const { data: signatures = [], isLoading } = useDigitalSignatures();
  const createSignature = useCreateSignature();
  const deleteSignature = useDeleteSignature();
  const [showDialog, setShowDialog] = useState(false);
  const [mode, setMode] = useState<'canvas' | 'upload'>('canvas');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [crea, setCrea] = useState('');
  const [uploading, setUploading] = useState(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    if (!showDialog || mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [showDialog, mode]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDraw = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const uploadSignatureImage = async (blob: Blob): Promise<string> => {
    const path = `signatures/${Date.now()}_${name.replace(/\s/g, '_')}.png`;
    const { error } = await supabase.storage.from('documents').upload(path, blob);
    if (error) throw error;
    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSaveCanvas = async () => {
    if (!name.trim() || !role.trim()) {
      toast.error('Preencha nome e cargo');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    setUploading(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => b ? resolve(b) : reject(new Error('Falha ao gerar imagem')), 'image/png');
      });
      const url = await uploadSignatureImage(blob);
      await createSignature.mutateAsync({ signer_name: name.trim(), signer_role: role.trim(), signer_crea: crea.trim() || undefined, signature_url: url });
      toast.success('Assinatura salva');
      resetDialog();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err?.message || ''));
    }
    setUploading(false);
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!name.trim() || !role.trim()) {
      toast.error('Preencha nome e cargo antes de enviar');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadSignatureImage(file);
      await createSignature.mutateAsync({ signer_name: name.trim(), signer_role: role.trim(), signer_crea: crea.trim() || undefined, signature_url: url });
      toast.success('Assinatura salva');
      resetDialog();
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + (err?.message || ''));
    }
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover assinatura?')) return;
    await deleteSignature.mutateAsync(id);
    toast.success('Assinatura removida');
  };

  const resetDialog = () => {
    setShowDialog(false);
    setName('');
    setRole('');
    setCrea('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assinaturas Digitais</h3>
          <p className="text-sm text-muted-foreground">Gerencie assinaturas usadas nos certificados</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Nova Assinatura
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : signatures.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PenTool className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhuma assinatura cadastrada</p>
            <Button variant="outline" className="mt-4" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> Cadastrar primeira assinatura
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatures.map(sig => (
            <Card key={sig.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{sig.signer_name}</CardTitle>
                <CardDescription className="text-xs">
                  {sig.signer_role}{sig.signer_crea && ` · CREA ${sig.signer_crea}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="border rounded-lg p-2 bg-white">
                  <img src={sig.signature_url} alt={sig.signer_name} className="h-16 w-auto mx-auto object-contain" />
                </div>
                <Button variant="ghost" size="sm" className="text-destructive w-full" onClick={() => handleDelete(sig.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Remover
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Assinatura Digital</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nome do Signatário *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" />
              </div>
              <div className="space-y-1.5">
                <Label>Cargo *</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Ex: Diretor Técnico" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>CREA / Registro Profissional (opcional)</Label>
              <Input value={crea} onChange={e => setCrea(e.target.value)} placeholder="Ex: 123456/SP" />
            </div>

            <div className="flex gap-2">
              <Button variant={mode === 'canvas' ? 'default' : 'outline'} size="sm" onClick={() => setMode('canvas')}>
                <PenTool className="h-3 w-3 mr-1" /> Desenhar
              </Button>
              <Button variant={mode === 'upload' ? 'default' : 'outline'} size="sm" onClick={() => setMode('upload')}>
                <Upload className="h-3 w-3 mr-1" /> Enviar Imagem
              </Button>
            </div>

            {mode === 'canvas' && (
              <div className="space-y-2">
                <div className="border rounded-lg overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={440}
                    height={160}
                    className="w-full cursor-crosshair"
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <Eraser className="h-3 w-3 mr-1" /> Limpar
                  </Button>
                  <Button size="sm" className="ml-auto" onClick={handleSaveCanvas} disabled={uploading}>
                    {uploading ? 'Salvando...' : 'Salvar Assinatura'}
                  </Button>
                </div>
              </div>
            )}

            {mode === 'upload' && (
              <div className="space-y-2">
                <Label>Imagem da assinatura (PNG ou SVG)</Label>
                <Input type="file" accept="image/png,image/svg+xml" onChange={handleUploadFile} disabled={uploading} />
                <p className="text-xs text-muted-foreground">Fundo transparente ou branco recomendado</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
