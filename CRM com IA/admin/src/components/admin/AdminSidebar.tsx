import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
} from 'lucide-react';
import {
  fixedItems,
  menuGroups,
  findGroupIdForSection,
} from '@/config/adminMenu';
import type { AdminMenuItem } from '@/config/adminMenu';
import { useAuth } from '@/hooks/useAuth';
import { prefetchAdminSection } from '@/pages/Admin';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();

  const activeGroupId = findGroupIdForSection(activeSection);

  const renderMenuItem = (item: AdminMenuItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const isDisabled = !!item.comingSoon;

    return (
      <button
        key={item.id}
        onClick={() => {
          if (isDisabled) return;
          onSectionChange(item.id);
        }}
        onMouseEnter={() => !isDisabled && prefetchAdminSection(item.id)}
        onTouchStart={() => !isDisabled && prefetchAdminSection(item.id)}
        onFocus={() => !isDisabled && prefetchAdminSection(item.id)}
        disabled={isDisabled}
        title={isDisabled ? `${item.label} — em breve` : item.label}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          collapsed && 'justify-center px-2',
          isDisabled
            ? 'text-sidebar-foreground/50 cursor-not-allowed hover:bg-transparent'
            : isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}
        {!collapsed && isDisabled && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
            em breve
          </Badge>
        )}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 overflow-hidden',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between flex-shrink-0">
        {!collapsed && (
          <div className="logo-3d-wrapper h-12 md:h-14 lg:h-16">
            <img
              src="/admin/assets/imagens/logo-3d.png"
              alt="Ferribor - Artefatos de Borracha"
              draggable="false"
              className="logo-3d-img"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0">
        {/* Fixos */}
        {fixedItems.map(renderMenuItem)}

        {collapsed ? (
          <>
            {/* Modo colapsado: lista plana de ícones */}
            <div className="py-2">
              <Separator className="bg-sidebar-border" />
            </div>
            {menuGroups.flatMap((g) => g.items).map(renderMenuItem)}
          </>
        ) : (
          <>
            <div className="pt-3 pb-1">
              <Separator className="bg-sidebar-border" />
            </div>

            <Accordion
              type="multiple"
              defaultValue={activeGroupId ? [activeGroupId] : []}
              className="w-full"
            >
              {menuGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <AccordionItem
                    key={group.id}
                    value={group.id}
                    className="border-none"
                  >
                    <AccordionTrigger className="px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:no-underline [&[data-state=open]]:bg-sidebar-accent/50">
                      <span className="flex items-center gap-3">
                        <GroupIcon className="h-4 w-4 flex-shrink-0" />
                        <span>{group.label}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-1">
                      <div className="pl-3 space-y-1 border-l border-sidebar-border ml-4">
                        {group.items.map(renderMenuItem)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </>
        )}

      </nav>

      {/* Logout */}
      <div className="px-2 pb-2 flex-shrink-0">
        <button
          onClick={() => signOut()}
          title="Sair"
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
            'text-destructive hover:bg-destructive/10',
            collapsed && 'justify-center px-2'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border flex-shrink-0">
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <p className="text-xs text-muted-foreground">
              Admin v1.1
            </p>
          )}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
