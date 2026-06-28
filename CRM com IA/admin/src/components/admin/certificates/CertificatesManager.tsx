import { useState } from 'react';
import { useCertificates, useCertificateStats, CERTIFICATE_TYPES, type CertificateType, type Certificate } from '@/hooks/useCertificates';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Shield, Leaf, TreePine, Globe, Earth, Plus, Search, FileText, PenTool } from 'lucide-react';
import { CertificateFormDialog } from './CertificateFormDialog';
import { CertificateDetailDrawer } from './CertificateDetailDrawer';
import { SignaturesManager } from './signatures/SignaturesManager';

const TYPE_ICONS: Record<string, typeof Shield> = {
  vedacao: Shield,
  co2: Leaf,
  esg: TreePine,
  iso_9001: Award,
  iso_14001: Globe,
  impacto_ambiental: Earth,
};

const TYPE_COLORS: Record<string, string> = {
  vedacao: 'bg-blue-500/10 text-blue-600',
  co2: 'bg-green-500/10 text-green-600',
  esg: 'bg-emerald-500/10 text-emerald-600',
  iso_9001: 'bg-amber-500/10 text-amber-600',
  iso_14001: 'bg-teal-500/10 text-teal-600',
  impacto_ambiental: 'bg-purple-500/10 text-purple-600',
};

export function CertificatesManager() {
  const [activeType, setActiveType] = useState<CertificateType | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<CertificateType>('vedacao');
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const { data: stats } = useCertificateStats();
  const { data: certificates = [], isLoading } = useCertificates(activeType || 'all');

  const filtered = certificates.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.client_name?.toLowerCase().includes(q) ||
      c.client_company?.toLowerCase().includes(q) ||
      c.client_cnpj?.toLowerCase().includes(q) ||
      String(c.certificate_number).includes(q)
    );
  });

  const handleNewCertificate = (type: CertificateType) => {
    setFormType(type);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Certificados</h2>
          <p className="text-muted-foreground text-sm">Emita e gerencie certificados com assinatura digital</p>
        </div>
      </div>

      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certificates" className="gap-1.5"><FileText className="h-4 w-4" />Certificados</TabsTrigger>
          <TabsTrigger value="signatures" className="gap-1.5"><PenTool className="h-4 w-4" />Assinaturas</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          {/* Type Cards Grid */}
          {!activeType && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {CERTIFICATE_TYPES.map(t => {
                const Icon = TYPE_ICONS[t.type] || Award;
                const colorClass = TYPE_COLORS[t.type] || 'bg-primary/10 text-primary';
                const stat = stats?.byType.find(s => s.type === t.type);
                return (
                  <Card
                    key={t.type}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handleNewCertificate(t.type)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); setActiveType(t.type); }}
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{t.label}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{stat?.count ?? 0} emitidos</span>
                        {(stat?.count ?? 0) > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {stat?.issuedCount ?? 0} ativos
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Filtered List View */}
          {activeType && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => setActiveType(null)}>
                  ← Todos os tipos
                </Button>
                <h3 className="font-semibold">
                  {CERTIFICATE_TYPES.find(t => t.type === activeType)?.label}
                </h3>
                <Button size="sm" className="ml-auto" onClick={() => handleNewCertificate(activeType)}>
                  <Plus className="h-4 w-4 mr-1" /> Novo Certificado
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por cliente, CNPJ, número..."
                  className="pl-9"
                />
              </div>

              {isLoading ? (
                <div className="text-center text-muted-foreground py-12">Carregando...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum certificado encontrado</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleNewCertificate(activeType)}>
                    <Plus className="h-4 w-4 mr-1" /> Emitir primeiro certificado
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map(cert => (
                    <Card
                      key={cert.id}
                      className="cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setSelectedCert(cert)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${TYPE_COLORS[cert.type]}`}>
                          {(() => { const I = TYPE_ICONS[cert.type] || Award; return <I className="h-4 w-4" />; })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">#{cert.certificate_number}</span>
                            <Badge variant={cert.status === 'issued' ? 'default' : 'secondary'} className="text-[10px]">
                              {cert.status === 'issued' ? 'Emitido' : cert.status === 'draft' ? 'Rascunho' : 'Revogado'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {cert.client_company || cert.client_name || 'Sem cliente'}
                            {cert.client_cnpj && ` · ${cert.client_cnpj}`}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          {cert.issued_at
                            ? new Date(cert.issued_at).toLocaleDateString('pt-BR')
                            : new Date(cert.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="signatures">
          <SignaturesManager />
        </TabsContent>
      </Tabs>

      <CertificateFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        type={formType}
      />

      <CertificateDetailDrawer
        certificate={selectedCert}
        open={!!selectedCert}
        onOpenChange={(open) => { if (!open) setSelectedCert(null); }}
      />
    </div>
  );
}
