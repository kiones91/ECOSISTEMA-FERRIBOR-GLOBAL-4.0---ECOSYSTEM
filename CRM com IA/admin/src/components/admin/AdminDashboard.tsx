import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart,
  Leaf, Clock, Factory, BarChart3, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

const faturamentoMensal = [
  { mes: 'Jan', faturamento: 620000, pedidos: 98, meta: 700000 },
  { mes: 'Fev', faturamento: 580000, pedidos: 91, meta: 700000 },
  { mes: 'Mar', faturamento: 710000, pedidos: 112, meta: 700000 },
  { mes: 'Abr', faturamento: 690000, pedidos: 108, meta: 750000 },
  { mes: 'Mai', faturamento: 780000, pedidos: 128, meta: 750000 },
  { mes: 'Jun', faturamento: 847320, pedidos: 142, meta: 800000 },
];

const produtosMaisVendidos = [
  { produto: 'O-Ring NBR 70 Shore A', categoria: 'Vedações', qtd: 4200, receita: 168000 },
  { produto: 'Rolo Revestido ø800mm', categoria: 'Rolos', qtd: 38, receita: 152000 },
  { produto: 'Retentor Viton ø120mm', categoria: 'Vedações', qtd: 1850, receita: 129500 },
  { produto: 'Pé Nivelador M16 - 5 ton', categoria: 'Niveladores', qtd: 620, receita: 93000 },
  { produto: 'Raspador PU Cerâmica 1200mm', categoria: 'Cerâmica', qtd: 180, receita: 72000 },
  { produto: 'Isolante Silicone MIG/TIG', categoria: 'Solda', qtd: 340, receita: 54400 },
  { produto: 'Coxim Motor Trator', categoria: 'Agro', qtd: 95, receita: 47500 },
  { produto: 'Gaxeta PTFE Expandido', categoria: 'Vedações', qtd: 890, receita: 44500 },
];

const melhoresClientes = [
  { cliente: 'Cerâmica São Carlos Ltda', segmento: 'Cerâmica', pedidos: 18, faturamento: 186400, crescimento: 14 },
  { cliente: 'Metalúrgica Horizonte S.A.', segmento: 'Metalurgia', pedidos: 14, faturamento: 142800, crescimento: 8 },
  { cliente: 'Usina Santa Helena', segmento: 'Sucroalcooleiro', pedidos: 11, faturamento: 128600, crescimento: -3 },
  { cliente: 'Ind. Papel Votorantim', segmento: 'Papel/Celulose', pedidos: 9, faturamento: 98200, crescimento: 22 },
  { cliente: 'Agro Máquinas Campinas', segmento: 'Agrícola', pedidos: 12, faturamento: 87400, crescimento: 31 },
  { cliente: 'Frigorífico Central BR', segmento: 'Alimentício', pedidos: 8, faturamento: 76300, crescimento: 5 },
];

const pedidosRecentes = [
  { id: 'PED-2026-0891', cliente: 'Cerâmica São Carlos', produto: 'Rolo Revestido ø600mm (x4)', valor: 32400, status: 'Em produção', data: '24/06' },
  { id: 'PED-2026-0890', cliente: 'Metalúrgica Horizonte', produto: 'O-Ring NBR 70 (lote 500un)', valor: 8750, status: 'Expedido', data: '23/06' },
  { id: 'PED-2026-0889', cliente: 'Usina Santa Helena', produto: 'Retentor Viton ø120mm (x80)', valor: 14200, status: 'Expedido', data: '23/06' },
  { id: 'PED-2026-0888', cliente: 'Agro Máquinas', produto: 'Coxim Motor (x40) + Vedação (x60)', valor: 11800, status: 'Em produção', data: '22/06' },
  { id: 'PED-2026-0887', cliente: 'Ind. Papel Votorantim', produto: 'Raspador PU 1200mm (x12)', valor: 18600, status: 'Aguardando material', data: '21/06' },
  { id: 'PED-2026-0886', cliente: 'Frigorífico Central', produto: 'Vedação Silicone FDA (x200)', valor: 9400, status: 'Expedido', data: '20/06' },
];

const distribuicaoCategoria = [
  { name: 'Vedações', value: 35 },
  { name: 'Rolos', value: 22 },
  { name: 'Niveladores', value: 15 },
  { name: 'Cerâmica', value: 12 },
  { name: 'Solda', value: 9 },
  { name: 'Agro', value: 7 },
];

const esgData = [
  { mes: 'Jan', co2Evitado: 1.2, reciclado: 320, recondicionados: 14 },
  { mes: 'Fev', co2Evitado: 1.4, reciclado: 380, recondicionados: 18 },
  { mes: 'Mar', co2Evitado: 1.8, reciclado: 420, recondicionados: 22 },
  { mes: 'Abr', co2Evitado: 1.6, reciclado: 390, recondicionados: 19 },
  { mes: 'Mai', co2Evitado: 2.1, reciclado: 450, recondicionados: 25 },
  { mes: 'Jun', co2Evitado: 2.4, reciclado: 510, recondicionados: 28 },
];

const statusColors: Record<string, string> = {
  'Expedido': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Em produção': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'Aguardando material': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export function AdminDashboard() {
  const [periodo] = useState('6m');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Administrativo</h1>
          <p className="text-muted-foreground text-sm">FerriBor — Artefatos de Borracha, Silicone e PU</p>
        </div>
        <Badge variant="outline" className="self-start sm:self-auto text-xs">
          <Clock className="h-3 w-3 mr-1" />
          Atualizado agora
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon={DollarSign} label="Faturamento Mensal" value="R$ 847k" change="+12.4%" positive />
        <KpiCard icon={ShoppingCart} label="Pedidos no Mês" value="142" change="+8.2%" positive />
        <KpiCard icon={Package} label="Ticket Médio" value="R$ 5.967" change="+3.1%" positive />
        <KpiCard icon={Users} label="Clientes Ativos" value="67" change="+5 novos" positive />
        <KpiCard icon={Leaf} label="CO₂ Evitado" value="2.4 ton" change="-18% emissão" positive />
        <KpiCard icon={Clock} label="Prazo Médio" value="4.2 dias" change="-0.8 dias" positive />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Faturamento + Meta */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Faturamento vs Meta — Últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name === 'faturamento' ? 'Faturamento' : 'Meta']} />
                  <Area type="monotone" dataKey="meta" stroke="#94a3b8" fill="#94a3b820" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="faturamento" stroke="#ef4444" fill="#ef444415" strokeWidth={2} />
                  <Legend formatter={(v) => v === 'faturamento' ? 'Faturamento' : 'Meta'} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Receita por Linha</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribuicaoCategoria} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, value }) => `${value}%`} labelLine={false}>
                    {distribuicaoCategoria.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {distribuicaoCategoria.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
                  {cat.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ESG / Economia Circular */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4 text-emerald-600" />
              Economia Circular / ESG
            </CardTitle>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              2.4 ton CO₂ evitadas em Jun
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">Rolos recondicionados + materiais reciclados = menor pegada ambiental</p>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={esgData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip />
                <Bar dataKey="co2Evitado" name="CO₂ Evitado (ton)" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="recondicionados" name="Produtos Recondicionados" fill="#06b6d4" radius={[4,4,0,0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Produtos mais vendidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos Mais Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-[10px] font-bold uppercase text-muted-foreground">Produto</th>
                    <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Qtd</th>
                    <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosMaisVendidos.slice(0, 6).map((p, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2">
                        <p className="font-medium text-foreground text-xs">{p.produto}</p>
                        <p className="text-[10px] text-muted-foreground">{p.categoria}</p>
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">{p.qtd.toLocaleString('pt-BR')}</td>
                      <td className="py-2 text-right text-xs font-medium text-foreground">{formatCurrency(p.receita)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Melhores Clientes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Melhores Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-[10px] font-bold uppercase text-muted-foreground">Cliente</th>
                    <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Pedidos</th>
                    <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {melhoresClientes.map((c, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2">
                        <p className="font-medium text-foreground text-xs">{c.cliente}</p>
                        <p className="text-[10px] text-muted-foreground">{c.segmento}</p>
                      </td>
                      <td className="py-2 text-right text-xs text-muted-foreground">{c.pedidos}</td>
                      <td className="py-2 text-right text-xs">
                        <span className="font-medium text-foreground">{formatCurrency(c.faturamento)}</span>
                        <span className={`ml-1 text-[10px] ${c.crescimento >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {c.crescimento >= 0 ? '+' : ''}{c.crescimento}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4" />
              Pedidos Recentes
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
              Ver todos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-[10px] font-bold uppercase text-muted-foreground">Pedido</th>
                  <th className="text-left py-2 text-[10px] font-bold uppercase text-muted-foreground">Cliente</th>
                  <th className="text-left py-2 text-[10px] font-bold uppercase text-muted-foreground hidden md:table-cell">Produto</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Valor</th>
                  <th className="text-center py-2 text-[10px] font-bold uppercase text-muted-foreground">Status</th>
                  <th className="text-right py-2 text-[10px] font-bold uppercase text-muted-foreground">Data</th>
                </tr>
              </thead>
              <tbody>
                {pedidosRecentes.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 font-mono text-[11px] text-muted-foreground">{p.id}</td>
                    <td className="py-2 text-xs font-medium text-foreground">{p.cliente}</td>
                    <td className="py-2 text-xs text-muted-foreground max-w-[180px] truncate hidden md:table-cell">{p.produto}</td>
                    <td className="py-2 text-right text-xs font-medium text-foreground">{formatCurrency(p.valor)}</td>
                    <td className="py-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[p.status] || ''}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 text-right text-xs text-muted-foreground">{p.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, change, positive }: {
  icon: React.ElementType; label: string; value: string; change: string; positive: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <div className="flex items-center gap-1 mt-1">
          {positive ? <TrendingUp className="h-3 w-3 text-emerald-600" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
          <span className={`text-[11px] font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
