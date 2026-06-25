import { Badge } from '@/components/ui/badge';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }> = {
  pending: { label: 'Aguardando aprovação', variant: 'outline', className: 'border-yellow-500/50 text-yellow-600 bg-yellow-500/10' },
  approved: { label: 'Aprovado', variant: 'outline', className: 'border-blue-500/50 text-blue-600 bg-blue-500/10' },
  in_vulcanization: { label: 'Em vulcanização', variant: 'outline', className: 'border-orange-500/50 text-orange-600 bg-orange-500/10' },
  in_production: { label: 'Em produção', variant: 'outline', className: 'border-purple-500/50 text-purple-600 bg-purple-500/10' },
  in_expedition: { label: 'Em expedição', variant: 'outline', className: 'border-indigo-500/50 text-indigo-600 bg-indigo-500/10' },
  in_transit: { label: 'Em rota de entrega', variant: 'outline', className: 'border-sky-500/50 text-sky-600 bg-sky-500/10' },
  at_carrier: { label: 'Na transportadora', variant: 'outline', className: 'border-teal-500/50 text-teal-600 bg-teal-500/10' },
  delivered: { label: 'Entregue', variant: 'outline', className: 'border-green-500/50 text-green-600 bg-green-500/10' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] || { label: status, variant: 'secondary' as const };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
