import {
  LayoutDashboard,
  Settings,
  Bell,
  MessageSquare,
  BarChart3,
  Zap,
  FileText,
  Bot,
  Plug,
  Tag,
  Clock,
  Sparkles,
  Shield,
  Smartphone,
  ScrollText,
  Wrench,
  Mail,
  ShoppingCart,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AdminMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

export interface AdminMenuGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminMenuItem[];
}

// Itens fixos (sempre visíveis, sem accordion)
export const fixedItems: AdminMenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inbox', label: 'Atendimentos', icon: MessageSquare },
  { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
  { id: 'certificates', label: 'Certificados', icon: Award },
];

// Grupos em accordion
export const menuGroups: AdminMenuGroup[] = [
  {
    id: 'automation',
    label: 'Automação & IA',
    icon: Sparkles,
    items: [
      { id: 'agents', label: 'Agentes IA', icon: Bot },
      { id: 'capture', label: 'Funil', icon: Zap },
    ],
  },
  {
    id: 'settings',
    label: 'Configurações',
    icon: Settings,
    items: [
      { id: 'connections', label: 'Conexões', icon: Plug },
      { id: 'integrations', label: 'Integrações', icon: Settings },
      { id: 'custom-fields', label: 'Campos personalizados', icon: FileText },
      { id: 'tags', label: 'Etiquetas', icon: Tag },
      { id: 'notifications', label: 'Notificações', icon: Bell },
      { id: 'schedules', label: 'Horários', icon: Clock },
    ],
  },
  {
    id: 'platform',
    label: 'Plataforma',
    icon: Shield,
    items: [
      { id: 'platform-whatsapp', label: 'WhatsApp / Evolution', icon: Smartphone },
      { id: 'platform-agent-tools', label: 'Ações dos Agentes', icon: Wrench },
      { id: 'platform-ai-quality', label: 'Qualidade da IA', icon: BarChart3 },
      { id: 'platform-email', label: 'E-mail', icon: Mail },
      { id: 'platform-audit', label: 'Logs de Auditoria', icon: ScrollText },
    ],
  },
];

export const allMenuItems: AdminMenuItem[] = [
  ...fixedItems,
  ...menuGroups.flatMap((g) => g.items),
];

// Helper: encontra o id do grupo que contém a seção ativa (para abrir o accordion)
export function findGroupIdForSection(sectionId: string): string | undefined {
  return menuGroups.find((g) => g.items.some((i) => i.id === sectionId))?.id;
}
