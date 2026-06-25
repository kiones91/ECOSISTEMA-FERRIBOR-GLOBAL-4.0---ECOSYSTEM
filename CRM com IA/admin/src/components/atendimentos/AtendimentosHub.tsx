import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BarChart3, Users } from 'lucide-react';
import { WebChatInbox } from '@/components/admin/webchat/WebChatInbox';
import { WebChatReportsTab } from '@/components/admin/webchat/WebChatReportsTab';
import { SellerInbox } from '@/components/seller/SellerInbox';
import { PortalInbox } from '@/components/admin/portal/PortalInbox';
import { cn } from '@/lib/utils';

type Props = {
  mode?: 'admin' | 'seller';
  productId?: string;
  pendingConversationId?: string | null;
  onConversationSelected?: () => void;
  showReports?: boolean;
  compactHeader?: boolean;
};

export function AtendimentosHub({
  mode = 'admin',
  productId,
  pendingConversationId,
  onConversationSelected,
  showReports = true,
  compactHeader = false,
}: Props) {
  const [activeTab, setActiveTab] = useState('portal');
  const tabCols = showReports ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div className={cn('space-y-4', compactHeader && 'space-y-2')}>
      {!compactHeader && (
        <div>
          <h1 className="text-2xl font-bold">Atendimentos</h1>
          <p className="text-sm text-muted-foreground">
            Portal do Cliente, WhatsApp e chat do site — tudo no CRM.
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={cn('grid w-full lg:w-auto lg:inline-grid', tabCols)}>
          <TabsTrigger value="portal" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Portal</span>
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Inbox</span>
          </TabsTrigger>
          {showReports && (
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="portal" className="space-y-4 mt-0">
          <PortalInbox />
        </TabsContent>

        <TabsContent value="inbox" className="space-y-4 mt-0">
          {mode === 'admin' ? (
            <WebChatInbox />
          ) : (
            <SellerInbox
              productId={productId}
              pendingConversationId={pendingConversationId}
              onConversationSelected={onConversationSelected}
            />
          )}
        </TabsContent>

        {showReports && (
          <TabsContent value="reports" className="space-y-4 mt-0">
            <WebChatReportsTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
