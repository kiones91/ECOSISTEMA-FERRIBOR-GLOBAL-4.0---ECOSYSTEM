import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateCertificate, CERTIFICATE_TYPES, type CertificateType } from '@/hooks/useCertificates';
import { useDigitalSignatures } from '@/hooks/useDigitalSignatures';
import { useClientSearch, type ClientResult } from '@/hooks/useClientSearch';
import { useOrders } from '@/hooks/useOrders';
import { toast } from 'sonner';
import { Search, User, Building2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: CertificateType;
}

export function CertificateFormDialog({ open, onOpenChange, type }: Props) {
  const createCert = useCreateCertificate();
  const { data: signatures = [] } = useDigitalSignatures();
  const { data: clientOrders = [] } = useOrders();

  const [clientQuery, setClientQuery] = useState('');
  const { data: clientResults = [] } = useClientSearch(clientQuery);

  const [form, setForm] = useState({
    client_name: '',
    client_company: '',
    client_cnpj: '',
    client_address: '',
    client_id: '',
    order_id: '',
    signature_ids: [] as string[],
    notes: '',
    valid_until: '',
    data: {} as Record<string, string>,
  });

  const typeLabel = CERTIFICATE_TYPES.find(t => t.type === type)?.label || type;

  const selectClient = (client: ClientResult) => {
    setForm(f => ({
      ...f,
      client_id: client.id,
      client_name: client.name,
      client_company: client.company || '',
      client_cnpj: client.cnpj || '',
      client_address: client.address || '',
    }));
    setClientQuery('');
  };

  const handleSubmit = async () => {
    if (!form.client_name && !form.client_company) {
      toast.error('Selecione ou preencha os dados do cliente');
      return;
    }
    if (form.signature_ids.length === 0) {
      toast.error('Selecione ao menos uma assinatura');
      return;
    }

    try {
      await createCert.mutateAsync({
        type,
        status: 'issued',
        client_id: form.client_id || null,
        client_name: form.client_name,
        client_company: form.client_company,
        client_cnpj: form.client_cnpj,
        client_address: form.client_address,
        order_id: form.order_id || null,
        signature_ids: form.signature_ids,
        notes: form.notes || null,
        valid_until: form.valid_until || null,
        data: form.data,
        issued_at: new Date().toISOString(),
      });
      toast.success('Certificado emitido com sucesso');
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      toast.error('Erro ao emitir: ' + (err?.message || ''));
    }
  };

  const resetForm = () => {
    setForm({ client_name: '', client_company: '', client_cnpj: '', client_address: '', client_id: '', order_id: '', signature_ids: [], notes: '', valid_until: '', data: {} });
    setClientQuery('');
  };

  const updateData = (key: string, value: string) => {
    setForm(f => ({ ...f, data: { ...f.data, [key]: value } }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Emitir {typeLabel}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Client Search */}
          <div className="space-y-2">
            <Label className="font-semibold">Cliente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={clientQuery}
                onChange={e => setClientQuery(e.target.value)}
                placeholder="Buscar por CNPJ, Nome Fantasia ou Comprador..."
                className="pl-9"
              />
            </div>
            {clientResults.length > 0 && clientQuery.length >= 2 && (
              <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
                {clientResults.map((c, i) => (
                  <button
                    key={i}
                    className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm flex items-center gap-2"
                    onClick={() => selectClient(c)}
                  >
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium">{c.company || c.name}</span>
                    {c.cnpj && <span className="text-muted-foreground text-xs ml-auto">{c.cnpj}</span>}
                  </button>
                ))}
              </div>
            )}

            {form.client_name && (
              <div className="bg-muted/30 rounded-lg p-3 text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{form.client_company || form.client_name}</span>
                </div>
                {form.client_cnpj && <p className="text-xs text-muted-foreground pl-5">CNPJ: {form.client_cnpj}</p>}
                {form.client_address && <p className="text-xs text-muted-foreground pl-5">{form.client_address}</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome / Razão Social</Label>
                <Input value={form.client_name} onChange={e => setForm(f => ({ ...f, client_name: e.target.value }))} placeholder="Nome do cliente" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Empresa</Label>
                <Input value={form.client_company} onChange={e => setForm(f => ({ ...f, client_company: e.target.value }))} placeholder="Nome fantasia" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">CNPJ/CPF</Label>
                <Input value={form.client_cnpj} onChange={e => setForm(f => ({ ...f, client_cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Endereço</Label>
                <Input value={form.client_address} onChange={e => setForm(f => ({ ...f, client_address: e.target.value }))} placeholder="Endereço completo" />
              </div>
            </div>
          </div>

          {/* Certificate-specific fields */}
          <div className="space-y-2">
            <Label className="font-semibold">Dados do Certificado</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Lote / Referência</Label>
                <Input value={form.data.lote || ''} onChange={e => updateData('lote', e.target.value)} placeholder="Ex: LOTE-2026-001" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Norma de Referência</Label>
                <Input value={form.data.norma || ''} onChange={e => updateData('norma', e.target.value)} placeholder="Ex: NBR 7214:2015" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Validade</Label>
                <Input type="date" value={form.valid_until} onChange={e => setForm(f => ({ ...f, valid_until: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Material / Compound</Label>
                <Input value={form.data.material || ''} onChange={e => updateData('material', e.target.value)} placeholder="Ex: NBR 70 Shore A" />
              </div>
            </div>
          </div>

          {/* Link to order */}
          <div className="space-y-2">
            <Label className="font-semibold">Vincular a Pedido (opcional)</Label>
            <Select value={form.order_id || 'none'} onValueChange={v => setForm(f => ({ ...f, order_id: v === 'none' ? '' : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pedido..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {clientOrders.filter(o => !form.client_cnpj || o.client_cpf_cnpj === form.client_cnpj).slice(0, 20).map(o => (
                  <SelectItem key={o.id} value={o.id}>
                    #{o.order_number} — {o.client_company || o.client_name} ({o.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Signatures */}
          <div className="space-y-2">
            <Label className="font-semibold">Assinatura(s) *</Label>
            {signatures.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma assinatura cadastrada. Cadastre na aba "Assinaturas".</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {signatures.map(sig => (
                  <label key={sig.id} className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/30">
                    <input
                      type="checkbox"
                      checked={form.signature_ids.includes(sig.id)}
                      onChange={e => {
                        setForm(f => ({
                          ...f,
                          signature_ids: e.target.checked
                            ? [...f.signature_ids, sig.id]
                            : f.signature_ids.filter(id => id !== sig.id),
                        }));
                      }}
                      className="rounded"
                    />
                    <img src={sig.signature_url} alt={sig.signer_name} className="h-8 w-auto object-contain" />
                    <div className="text-sm">
                      <span className="font-medium">{sig.signer_name}</span>
                      <span className="text-muted-foreground ml-1">· {sig.signer_role}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Observações adicionais..." />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={createCert.isPending}>
              {createCert.isPending ? 'Emitindo...' : 'Emitir Certificado'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
