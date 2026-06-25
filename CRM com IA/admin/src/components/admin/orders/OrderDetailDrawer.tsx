import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrderStatusBadge } from './OrderStatusBadge';
import { useUpdateOrderStatus, type Order } from '@/hooks/useOrders';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, User, Building2, Mail, Phone, FileText, MapPin, Calendar, Download, Printer, Upload, Shield, Leaf } from 'lucide-react';

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_FLOW = ['pending', 'approved', 'in_vulcanization', 'in_production', 'in_expedition', 'in_transit', 'at_carrier', 'delivered'];

export function OrderDetailDrawer({ order, open, onOpenChange }: Props) {
  const updateStatus = useUpdateOrderStatus();
  const [lote, setLote] = useState('');
  const [loteError, setLoteError] = useState(false);
  const [nfNumber, setNfNumber] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'in_expedition' && !lote.trim() && !order.lote) {
      setLoteError(true);
      toast.error('Preencha o LOTE antes de despachar');
      return;
    }
    setLoteError(false);
    try {
      const updates: Record<string, unknown> = {};
      if (lote.trim()) updates.lote = lote.trim();
      if (nfNumber.trim()) updates.nf_number = nfNumber.trim();
      if (Object.keys(updates).length > 0) {
        await supabase.from('orders').update(updates).eq('id', order.id);
      }
      await updateStatus.mutateAsync({ id: order.id, status: newStatus });
      toast.success('Status atualizado');
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleSaveNF = async () => {
    if (!nfNumber.trim()) return;
    try {
      await supabase.from('orders').update({
        nf_number: nfNumber.trim(),
        nf_status: 'issued',
        nf_issued_at: new Date().toISOString(),
      }).eq('id', order.id);
      toast.success('NF salva');
    } catch {
      toast.error('Erro ao salvar NF');
    }
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = `orders/${order.id}/certificates/${Date.now()}_${file.name}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
      const certs = order.certificates || [];
      certs.push({ type: file.name.includes('ISO') ? 'ISO' : file.name.includes('ESG') ? 'ESG' : 'certificate', name: file.name, url: urlData.publicUrl, uploaded_at: new Date().toISOString() });
      await supabase.from('orders').update({ certificates: certs }).eq('id', order.id);
      toast.success('Certificado anexado');
    } catch {
      toast.error('Erro ao enviar certificado');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const generatePdfContent = () => {
    const items = order.order_items || order.items || [];
    const certs = order.certificates || [];
    return `<html><head><title>Pedido N:${order.order_number || ''}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#1a1a1a}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #dc2626}
.logo{font-size:24px;font-weight:800;color:#dc2626}
.meta{text-align:right;font-size:12px;color:#666}
.meta strong{color:#1a1a1a}
.section{margin:20px 0}
.section-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #eee}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.field{margin-bottom:8px}
.field-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888}
.field-value{font-size:13px;font-weight:500}
table{width:100%;border-collapse:collapse;margin:10px 0}
th,td{border:1px solid #e5e5e5;padding:10px;text-align:left;font-size:12px}
th{background:#f9f9f9;font-weight:600;text-transform:uppercase;font-size:10px;letter-spacing:0.5px}
.total-row{font-weight:700;background:#fef2f2}
.nf-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:16px 0}
.nf-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;margin-bottom:8px}
.cert-list{margin-top:10px}
.cert-item{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;margin-bottom:6px;font-size:11px}
.footer{margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:10px;color:#888;text-align:center}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div>
    <div class="logo">FerriBor</div>
    <p style="font-size:11px;color:#666;margin-top:4px">Artefatos de Borracha</p>
  </div>
  <div class="meta">
    <p><strong>Pedido N:${order.order_number || order.id.slice(0,8)}</strong></p>
    <p>Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
    ${order.lote || lote ? `<p>LOTE: <strong>${order.lote || lote}</strong></p>` : ''}
    <p>Status: ${order.status}</p>
  </div>
</div>

${order.nf_number || nfNumber ? `
<div class="nf-box">
  <div class="nf-title">Nota Fiscal</div>
  <div class="grid">
    <div class="field"><div class="field-label">Numero NF</div><div class="field-value">${order.nf_number || nfNumber}</div></div>
    <div class="field"><div class="field-label">Serie</div><div class="field-value">${order.nf_serie || '001'}</div></div>
    <div class="field"><div class="field-label">Chave de Acesso</div><div class="field-value">${order.nf_access_key || 'Pendente integração SEFAZ'}</div></div>
    <div class="field"><div class="field-label">Status NF</div><div class="field-value">${order.nf_status || 'pending'}</div></div>
  </div>
</div>` : ''}

<div class="section">
  <div class="section-title">Emitente</div>
  <div class="grid">
    <div class="field"><div class="field-label">Razao Social</div><div class="field-value">Ferri Fabricação de Artefatos de Borracha Ltda</div></div>
    <div class="field"><div class="field-label">CNPJ</div><div class="field-value">20.036.263/0001-68</div></div>
    <div class="field"><div class="field-label">Municipio/UF</div><div class="field-value">Santa Gertrudes / SP</div></div>
    <div class="field"><div class="field-label">CNAE</div><div class="field-value">2219-6/00 - Fab. artefatos de borracha</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Destinatario</div>
  <div class="grid">
    <div class="field"><div class="field-label">Nome</div><div class="field-value">${order.client_name || ''}</div></div>
    <div class="field"><div class="field-label">Empresa</div><div class="field-value">${order.client_company || ''}</div></div>
    <div class="field"><div class="field-label">CNPJ/CPF</div><div class="field-value">${order.client_cpf_cnpj || ''}</div></div>
    <div class="field"><div class="field-label">IE</div><div class="field-value">${order.client_ie || ''}</div></div>
    <div class="field"><div class="field-label">Email</div><div class="field-value">${order.client_email || ''}</div></div>
    <div class="field"><div class="field-label">Telefone</div><div class="field-value">${order.client_phone || ''}</div></div>
    <div class="field" style="grid-column:1/-1"><div class="field-label">Endereco</div><div class="field-value">${order.shipping_address || ''}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Itens</div>
  <table>
    <thead><tr><th>Produto</th><th>Qtd</th><th>Unidade</th><th>Valor Unit.</th><th>Total</th></tr></thead>
    <tbody>
      ${items.map(i => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>R$ ${Number(i.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>R$ ${Number(i.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
      <tr class="total-row"><td colspan="4" style="text-align:right">TOTAL</td><td>R$ ${Number(order.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>
    </tbody>
  </table>
</div>

${certs.length > 0 ? `
<div class="section">
  <div class="section-title">Certificados Anexados</div>
  <div class="cert-list">
    ${certs.map(c => `<div class="cert-item"><span style="color:#16a34a">&#10003;</span> ${c.name} (${c.type})</div>`).join('')}
  </div>
</div>` : ''}

${order.notes ? `<div class="section"><div class="section-title">Observacoes</div><p style="font-size:13px">${order.notes}</p></div>` : ''}

<div class="footer">
  <p>Documento gerado pelo sistema FerriBor Global 4.0</p>
  <p style="margin-top:4px">Integração fiscal: SEFAZ (BR) | SUNAT (PE) | SII (CL) | AFIP (AR) | SAT (MX) — pendente configuração</p>
</div>
</body></html>`;
  };

  const handleDownloadPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(generatePdfContent());
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(generatePdfContent());
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Pedido N:{order.order_number || order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Status + Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <OrderStatusBadge status={order.status} />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
                <Download className="h-4 w-4 mr-1" /> Baixar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Imprimir
              </Button>
            </div>
          </div>

          {/* Status Change + LOTE */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Alterar status</Label>
              <Select value={order.status} onValueChange={handleStatusChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_FLOW.map(s => (
                    <SelectItem key={s} value={s}><OrderStatusBadge status={s} /></SelectItem>
                  ))}
                  <SelectItem value="rejected"><OrderStatusBadge status="rejected" /></SelectItem>
                  <SelectItem value="cancelled"><OrderStatusBadge status="cancelled" /></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className={`text-xs ${loteError ? 'text-destructive' : 'text-muted-foreground'}`}>
                LOTE {loteError && '(obrigatório p/ despacho)'}
              </Label>
              <Input
                value={lote || order.lote || ''}
                onChange={e => { setLote(e.target.value); setLoteError(false); }}
                placeholder="Número do lote..."
                className={loteError ? 'border-destructive' : ''}
              />
            </div>
          </div>

          <Separator />

          {/* NOTA FISCAL */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" /> Nota Fiscal
              {order.nf_status === 'issued' && <span className="text-[10px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">Emitida</span>}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Número NF</Label>
                <Input
                  value={nfNumber || order.nf_number || ''}
                  onChange={e => setNfNumber(e.target.value)}
                  placeholder="Ex: 001247"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Série</Label>
                <Input value={order.nf_serie || '001'} disabled className="opacity-60" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">Chave de Acesso (44 dígitos — integração SEFAZ pendente)</Label>
                <Input value={order.nf_access_key || ''} disabled placeholder="Será preenchida via API Receita Federal" className="opacity-60 font-mono text-xs" />
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleSaveNF} disabled={!nfNumber.trim()}>
              Salvar NF
            </Button>
            <p className="text-[10px] text-muted-foreground">Integração futura: SEFAZ (BR), SUNAT (PE), SII (CL), AFIP (AR), SAT (MX)</p>
          </div>

          <Separator />

          {/* CERTIFICADOS */}
          <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Shield className="h-4 w-4" /> Certificados
            </h3>
            <p className="text-xs text-muted-foreground">Anexe cada certificado no campo correspondente.</p>

            {/* Certificados já anexados */}
            {(order.certificates || []).length > 0 && (
              <div className="flex flex-wrap gap-2 pb-2">
                {(order.certificates || []).map((cert, i) => (
                  <a key={i} href={cert.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted transition bg-background">
                    {cert.type === 'ISO 9001' || cert.type === 'ISO 14001' ? <Shield className="h-3 w-3 text-blue-500" /> : <Leaf className="h-3 w-3 text-green-500" />}
                    <span className="font-medium">{cert.type}</span>
                    <span className="text-muted-foreground">— {cert.name}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Botões de upload por tipo */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { type: 'Vedação', column: 'cert_vedacao', icon: '🔒', color: 'border-amber-500/30 hover:bg-amber-500/5' },
                { type: 'Emissão CO²', column: 'cert_co2', icon: '🌿', color: 'border-green-500/30 hover:bg-green-500/5' },
                { type: 'ESG', column: 'cert_esg', icon: '🌍', color: 'border-emerald-500/30 hover:bg-emerald-500/5' },
                { type: 'ISO 9001', column: 'cert_iso_9001', icon: '🏅', color: 'border-blue-500/30 hover:bg-blue-500/5' },
                { type: 'ISO 14001', column: 'cert_iso_14001', icon: '🏅', color: 'border-indigo-500/30 hover:bg-indigo-500/5' },
                { type: 'Impacto Ambiental', column: 'cert_impacto_ambiental', icon: '♻️', color: 'border-teal-500/30 hover:bg-teal-500/5' },
              ].map(certType => {
                const existing = (order as any)[certType.column];
                return (
                  <label key={certType.type} className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 cursor-pointer transition text-center ${certType.color} ${existing ? 'bg-muted/50' : ''}`}>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        try {
                          const path = `orders/${order.id}/certificates/${certType.column}_${Date.now()}_${file.name}`;
                          const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
                          if (uploadErr) throw uploadErr;
                          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path);
                          await supabase.from('orders').update({
                            [certType.column]: { name: file.name, url: urlData.publicUrl, uploaded_at: new Date().toISOString() }
                          }).eq('id', order.id);
                          toast.success(`${certType.type} anexado`);
                        } catch {
                          toast.error(`Erro ao enviar ${certType.type}`);
                        }
                        setUploading(false);
                        e.target.value = '';
                      }}
                    />
                    <span className="text-lg">{certType.icon}</span>
                    <span className="text-[10px] font-medium leading-tight">{certType.type}</span>
                    {existing ? (
                      <a href={existing.url} target="_blank" rel="noreferrer" className="text-[9px] text-green-600 font-medium underline" onClick={e => e.stopPropagation()}>✓ Anexado</a>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">Clique p/ enviar</span>
                    )}
                  </label>
                );
              })}
            </div>

            <div className="text-[10px] text-muted-foreground pt-2 border-t">
              <p><strong>FerriBor:</strong> Borracha desviada de aterros: 320 kg | CO² economizado: 1.2 ton</p>
            </div>
          </div>

          <Separator />

          {/* Two columns layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" /> Dados do Cliente
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {order.client_name && <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span>{order.client_name}</span></div>}
                {order.client_company && <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-muted-foreground" /><span>{order.client_company}</span></div>}
                {order.client_email && <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span>{order.client_email}</span></div>}
                {order.client_phone && <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span>{order.client_phone}</span></div>}
                {order.client_cpf_cnpj && <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><span>CNPJ: {order.client_cpf_cnpj}</span></div>}
                {order.client_ie && <div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-muted-foreground" /><span>IE: {order.client_ie}</span></div>}
                {order.shipping_address && <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /><span>{order.shipping_address}</span></div>}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Resumo
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Data</span><span>{new Date(order.created_at).toLocaleDateString('pt-BR')}</span></div>
                {order.delivery_deadline && <div className="flex justify-between"><span className="text-muted-foreground">Prazo</span><span>{new Date(order.delivery_deadline).toLocaleDateString('pt-BR')}</span></div>}
                {(order.lote || lote) && <div className="flex justify-between"><span className="text-muted-foreground">LOTE</span><span className="font-mono font-bold">{order.lote || lote}</span></div>}
                {order.total_amount && <div className="flex justify-between font-semibold pt-2 border-t"><span>Total</span><span>R$ {Number(order.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>}
              </div>
              {order.notes && <div className="p-2 rounded-md bg-muted text-xs text-muted-foreground"><strong>Obs:</strong> {order.notes}</div>}
            </div>
          </div>

          <Separator />

          {/* Items table */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" /> Itens do Pedido
            </h3>
            {(order.order_items || order.items || []).length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-3 py-2 font-medium">Produto</th>
                    <th className="text-center px-3 py-2 font-medium">Qtd</th>
                    <th className="text-center px-3 py-2 font-medium">Un.</th>
                    <th className="text-right px-3 py-2 font-medium">Unit.</th>
                    <th className="text-right px-3 py-2 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.order_items || order.items || []).map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium">{item.product_name}
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">{Object.entries(item.specifications).map(([k, v]) => (<span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{k}: {String(v)}</span>))}</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">{item.quantity}</td>
                      <td className="px-3 py-2 text-center">{item.unit}</td>
                      <td className="px-3 py-2 text-right">{item.unit_price ? `R$ ${Number(item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</td>
                      <td className="px-3 py-2 text-right font-medium">{item.total_price ? `R$ ${Number(item.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum item registrado</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
