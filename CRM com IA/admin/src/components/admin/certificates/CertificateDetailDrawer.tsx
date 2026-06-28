import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type Certificate, CERTIFICATE_TYPES } from '@/hooks/useCertificates';
import { useDigitalSignatures } from '@/hooks/useDigitalSignatures';
import { COMPANY } from '@/config/branding';
import { Download, Printer, Share2, MessageSquare, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  certificate: Certificate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CertificateDetailDrawer({ certificate, open, onOpenChange }: Props) {
  const { data: signatures = [] } = useDigitalSignatures();
  const [showShare, setShowShare] = useState(false);

  if (!certificate) return null;

  const typeLabel = CERTIFICATE_TYPES.find(t => t.type === certificate.type)?.label || certificate.type;
  const certSignatures = signatures.filter(s => certificate.signature_ids.includes(s.id));
  const certData = certificate.data as Record<string, string>;

  const generatePdfContent = () => {
    return `<html><head><title>Certificado ${typeLabel} #${certificate.certificate_number}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#1a1a1a}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;padding-bottom:20px;border-bottom:3px solid #dc2626}
.logo{font-size:28px;font-weight:800;color:#dc2626}
.logo-sub{font-size:11px;color:#666;margin-top:4px}
.meta{text-align:right;font-size:12px;color:#666}
.meta strong{color:#1a1a1a}
.title{text-align:center;margin:30px 0;padding:20px;background:#fef2f2;border-radius:8px}
.title h1{font-size:22px;color:#dc2626;margin-bottom:4px}
.title p{font-size:12px;color:#666}
.section{margin:20px 0}
.section-title{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626;margin-bottom:10px;padding-bottom:5px;border-bottom:1px solid #eee}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.field{margin-bottom:8px}
.field-label{font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#888}
.field-value{font-size:13px;font-weight:500}
.signatures{display:flex;gap:40px;justify-content:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee}
.sig-block{text-align:center}
.sig-img{height:60px;margin-bottom:8px}
.sig-line{border-top:1px solid #333;padding-top:6px;min-width:180px}
.sig-name{font-size:12px;font-weight:600}
.sig-role{font-size:10px;color:#666}
.sig-crea{font-size:9px;color:#888;margin-top:2px}
.footer{margin-top:40px;padding-top:16px;border-top:1px solid #eee;font-size:9px;color:#888;text-align:center}
.validity{text-align:center;margin:16px 0;padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:11px;color:#166534}
@media print{body{padding:20px}}
</style></head><body>
<div class="header">
  <div>
    <div class="logo">FerriBor</div>
    <p class="logo-sub">Artefatos de Borracha, Silicone e PU</p>
    <p style="font-size:10px;color:#888;margin-top:2px">${COMPANY.address}</p>
  </div>
  <div class="meta">
    <p><strong>Certificado N° ${certificate.certificate_number}</strong></p>
    <p>CNPJ: 20.036.263/0001-68</p>
    <p>Emissão: ${certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('pt-BR') : new Date(certificate.created_at).toLocaleDateString('pt-BR')}</p>
  </div>
</div>

<div class="title">
  <h1>${typeLabel}</h1>
  <p>Documento de certificação técnica</p>
</div>

<div class="section">
  <div class="section-title">Destinatário</div>
  <div class="grid">
    <div class="field"><div class="field-label">Empresa</div><div class="field-value">${certificate.client_company || certificate.client_name || ''}</div></div>
    <div class="field"><div class="field-label">CNPJ/CPF</div><div class="field-value">${certificate.client_cnpj || ''}</div></div>
    <div class="field" style="grid-column:1/-1"><div class="field-label">Endereço</div><div class="field-value">${certificate.client_address || ''}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Dados Técnicos</div>
  <div class="grid">
    ${certData.lote ? `<div class="field"><div class="field-label">Lote / Referência</div><div class="field-value">${certData.lote}</div></div>` : ''}
    ${certData.norma ? `<div class="field"><div class="field-label">Norma</div><div class="field-value">${certData.norma}</div></div>` : ''}
    ${certData.material ? `<div class="field"><div class="field-label">Material / Compound</div><div class="field-value">${certData.material}</div></div>` : ''}
    ${certificate.order_id ? `<div class="field"><div class="field-label">Pedido Vinculado</div><div class="field-value">${certificate.order_id.slice(0, 8)}</div></div>` : ''}
  </div>
</div>

${certificate.valid_until ? `<div class="validity">Válido até: ${new Date(certificate.valid_until).toLocaleDateString('pt-BR')}</div>` : ''}

${certificate.notes ? `<div class="section"><div class="section-title">Observações</div><p style="font-size:12px">${certificate.notes}</p></div>` : ''}

<div class="signatures">
  ${certSignatures.map(sig => `
  <div class="sig-block">
    <img class="sig-img" src="${sig.signature_url}" alt="${sig.signer_name}" />
    <div class="sig-line">
      <div class="sig-name">${sig.signer_name}</div>
      <div class="sig-role">${sig.signer_role}</div>
      ${sig.signer_crea ? `<div class="sig-crea">CREA: ${sig.signer_crea}</div>` : ''}
    </div>
  </div>`).join('')}
</div>

<div class="footer">
  <p>${COMPANY.legal_name} — CNPJ 20.036.263/0001-68</p>
  <p>${COMPANY.address}</p>
  <p style="margin-top:4px">Documento gerado eletronicamente pelo sistema FerriBor Global 4.0</p>
</div>
</body></html>`;
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(generatePdfContent());
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const handleShareWhatsApp = () => {
    const phone = certificate.client_cnpj ? '' : '';
    const text = encodeURIComponent(
      `Olá! Segue o ${typeLabel} N° ${certificate.certificate_number} emitido pela FerriBor para ${certificate.client_company || certificate.client_name || 'sua empresa'}.\n\nQualquer dúvida estamos à disposição.\n\nAtenciosamente,\nFerriBor`
    );
    window.open(`https://wa.me/${COMPANY.whatsapp}?text=${text}`, '_blank');
    toast.success('WhatsApp aberto');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`${typeLabel} N° ${certificate.certificate_number} — FerriBor`);
    const body = encodeURIComponent(
      `Prezado(a),\n\nSegue em anexo o ${typeLabel} N° ${certificate.certificate_number}.\n\nEmitente: ${COMPANY.legal_name}\nCNPJ: 20.036.263/0001-68\n\nAtenciosamente,\nEquipe FerriBor\n${COMPANY.email}`
    );
    window.open(`mailto:${certificate.client_cnpj || ''}?subject=${subject}&body=${body}`, '_blank');
    toast.success('E-mail aberto');
  };

  const handleShareChat = () => {
    toast.info('Funcionalidade de envio pelo chat interno será integrada em breve.');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeLabel}
            <Badge variant={certificate.status === 'issued' ? 'default' : 'secondary'}>
              {certificate.status === 'issued' ? 'Emitido' : certificate.status === 'draft' ? 'Rascunho' : 'Revogado'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Certificate Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground uppercase">Número</p>
              <p className="font-medium">#{certificate.certificate_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">Emissão</p>
              <p className="font-medium">
                {certificate.issued_at
                  ? new Date(certificate.issued_at).toLocaleDateString('pt-BR')
                  : new Date(certificate.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            {certificate.valid_until && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Validade</p>
                <p className="font-medium">{new Date(certificate.valid_until).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Client Info */}
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase mb-1">Destinatário</p>
            <p className="font-medium">{certificate.client_company || certificate.client_name}</p>
            {certificate.client_cnpj && <p className="text-muted-foreground text-xs">{certificate.client_cnpj}</p>}
            {certificate.client_address && <p className="text-muted-foreground text-xs">{certificate.client_address}</p>}
          </div>

          {/* Technical Data */}
          {Object.keys(certData).length > 0 && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase mb-2">Dados Técnicos</p>
                <div className="grid grid-cols-2 gap-2">
                  {certData.lote && <div><span className="text-xs text-muted-foreground">Lote:</span> <span className="font-medium">{certData.lote}</span></div>}
                  {certData.norma && <div><span className="text-xs text-muted-foreground">Norma:</span> <span className="font-medium">{certData.norma}</span></div>}
                  {certData.material && <div><span className="text-xs text-muted-foreground">Material:</span> <span className="font-medium">{certData.material}</span></div>}
                </div>
              </div>
            </>
          )}

          {/* Signatures */}
          {certSignatures.length > 0 && (
            <>
              <Separator />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground uppercase mb-2">Assinaturas</p>
                <div className="flex gap-4">
                  {certSignatures.map(sig => (
                    <div key={sig.id} className="text-center">
                      <img src={sig.signature_url} alt={sig.signer_name} className="h-10 w-auto mx-auto mb-1 object-contain" />
                      <p className="text-xs font-medium">{sig.signer_name}</p>
                      <p className="text-[10px] text-muted-foreground">{sig.signer_role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase">Ações</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1.5" /> Imprimir / PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareWhatsApp}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareEmail}>
                <Mail className="h-3.5 w-3.5 mr-1.5" /> E-mail
              </Button>
              <Button variant="outline" size="sm" onClick={handleShareChat}>
                <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Chat Interno
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
