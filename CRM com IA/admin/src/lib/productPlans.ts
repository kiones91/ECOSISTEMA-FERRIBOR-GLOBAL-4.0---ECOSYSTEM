import type { ProductPlan } from '@/components/admin/products/tabs/PricingPlansSection';

/** Normaliza `products.pricing` (array, JSON string ou legado) em lista de planos. */
export function parseProductPlans(
  pricing: unknown,
  legacyPlansText?: string | null,
): ProductPlan[] {
  let raw: unknown[] = [];

  if (Array.isArray(pricing)) {
    raw = pricing;
  } else if (typeof pricing === 'string' && pricing.trim()) {
    try {
      const parsed = JSON.parse(pricing);
      if (Array.isArray(parsed)) raw = parsed;
    } catch {
      /* ignore */
    }
  }

  const plans = raw
    .filter((p): p is ProductPlan => !!p && typeof p === 'object' && 'name' in p)
    .map((p, i) => ({
      id: p.id || `plan-${i}`,
      name: p.name || 'Plano',
      price: Number(p.price) || 0,
      billing_cycle: p.billing_cycle || 'mensal',
      duration: p.duration || '',
      features: Array.isArray(p.features) ? p.features : [],
      recommended: !!p.recommended,
      active: p.active !== false,
    }));

  if (plans.length > 0) {
    return plans.filter((p) => p.active);
  }

  // Legado: products.plans (texto livre, uma linha por plano "Nome - R$ 297")
  if (legacyPlansText?.trim()) {
    return legacyPlansText
      .split('\n')
      .map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        const priceMatch = trimmed.match(/R?\$?\s*([\d.,]+)/i);
        const price = priceMatch
          ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) || 0
          : 0;
        const name = trimmed.replace(/R?\$?\s*[\d.,]+.*$/i, '').replace(/[-–—]\s*$/, '').trim() || trimmed;
        return {
          id: `legacy-${i}`,
          name,
          price,
          billing_cycle: 'mensal' as const,
          duration: '',
          features: [],
          recommended: false,
          active: true,
        };
      })
      .filter(Boolean) as ProductPlan[];
  }

  return [];
}

export function formatPlanLabel(plan: ProductPlan): string {
  const price = plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const cycle =
    plan.billing_cycle !== 'unico'
      ? `/${plan.billing_cycle === 'mensal' ? 'mês' : plan.billing_cycle}`
      : '';
  return `${plan.name} — ${price}${cycle}`;
}
