import { useEffect, useState, useRef, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getOrCreateConversation, getMessages, sendMessage, subscribeToMessages, type Message } from "@/lib/chat";

const tabs = [
  { id: "pedidos", label: "Pedidos" },
  { id: "recompra", label: "Recompra" },
  { id: "credit", label: "FerriBor Credit" },
  { id: "circular", label: "ESG" },
  { id: "documentos", label: "Documentos" },
] as const;

type TabId = (typeof tabs)[number]["id"];

type Attachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
};

export default function Home({ session }: { session: Session }) {
  const [nome, setNome] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabId>("pedidos");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("nome")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setNome(data?.nome || session.user.user_metadata?.nome || session.user.email || "");
      });
  }, [session]);

  useEffect(() => {
    getOrCreateConversation(session.user.id).then((conv) => {
      setConversationId(conv.id);
      getMessages(conv.id).then(setMessages);
    });
  }, [session.user.id]);

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeToMessages(conversationId, (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage() {
    if ((!message.trim() && attachments.length === 0) || !conversationId || sending) return;
    setSending(true);
    try {
      const atts = attachments.map((a) => ({ name: a.name, type: a.type, url: a.url }));
      const sent = await sendMessage(conversationId, session.user.id, message.trim(), atts);
      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setMessage("");
      setAttachments([]);
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
    setSending(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const newAttachments: Attachment[] = files.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
    const text = e.dataTransfer.getData("text/plain");
    if (text && !files.length) {
      setAttachments((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: text, type: "text/component", size: 0 },
      ]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const d = darkMode;

  return (
    <div className={`flex h-screen flex-col overflow-hidden antialiased ${d ? "bg-neutral-950 text-white" : "bg-white text-neutral-900"}`}>
      <header className={`shrink-0 border-b ${d ? "border-white/10 bg-neutral-950/80" : "border-neutral-200 bg-white"} backdrop-blur-md`}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="logo-3d-wrapper h-14 sm:h-16 md:h-24 lg:h-28">
              <img
                src="/assets/imagens/logo-3d.png"
                alt="Ferribor - Artefatos de Borracha"
                draggable="false"
                className="logo-3d-img"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-sm font-medium ${d ? "text-neutral-200" : "text-neutral-800"}`}>{nome}</p>
              <p className={`text-[11px] ${d ? "text-neutral-500" : "text-neutral-600"}`}>Portal do Cliente</p>
            </div>
            <div className="relative">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${d ? "border-white/10 bg-white/5" : "border-neutral-200 bg-neutral-100"}`}>
                <span className={`text-sm font-bold ${d ? "text-neutral-300" : "text-neutral-600"}`}>
                  {nome ? nome.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 bg-red-500 ${d ? "border-neutral-950" : "border-white"}`}></div>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`rounded-lg border p-2 transition ${d ? "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10" : "border-neutral-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
              title={d ? "Modo claro" : "Modo escuro"}
            >
              {d ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
            <button
              onClick={handleLogout}
              className={`rounded-lg border px-3 py-1.5 text-sm transition ${d ? "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10" : "border-neutral-200 text-neutral-600 hover:bg-neutral-100"}`}
            >
              Sair
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-red-500 text-red-500"
                  : d
                  ? "border-transparent text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex w-[340px] shrink-0 flex-col overflow-hidden rounded-2xl m-3 backdrop-blur-lg transition-all border ${
            d ? "bg-gradient-to-br from-white/[0.07] to-white/0 border-white/10" : "bg-neutral-50 border-neutral-200"
          } ${isDragging ? "ring-2 ring-red-500 ring-offset-2" : ""}`}
          style={isDragging ? { "--tw-ring-offset-color": d ? "#0a0a0a" : "#ffffff" } as React.CSSProperties : undefined}
        >
          <div className={`flex items-center justify-between border-b px-5 py-4 ${d ? "border-white/10" : "border-neutral-200"}`}>
            <div>
              <h2 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-800"}`}>Mensagens</h2>
              <p className={`text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>Chat com suporte FerriBor</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-lg border p-2 transition ${d ? "border-white/10 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200" : "border-neutral-200 bg-white text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"}`}
              title="Anexar arquivo"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          <div className="scroll-hide flex-1 overflow-y-auto p-4">
            {isDragging ? (
              <div className="flex h-full items-center justify-center rounded-xl border-2 border-dashed border-red-500/50 bg-red-500/5 p-6">
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p className="mt-2 text-sm font-medium text-red-400">Solte aqui</p>
                  <p className={`mt-1 text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>Imagens, PDFs, relatórios...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <svg className={`mx-auto h-8 w-8 ${d ? "text-neutral-700" : "text-neutral-300"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p className={`mt-3 text-sm ${d ? "text-neutral-500" : "text-neutral-600"}`}>Envie sua primeira mensagem.</p>
                  <p className={`mt-1 text-xs ${d ? "text-neutral-600" : "text-neutral-500"}`}>Arraste arquivos ou digite abaixo</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "client" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        msg.sender_type === "client"
                          ? "bg-red-600 text-white rounded-br-md"
                          : d
                          ? "bg-white/10 text-neutral-200 rounded-bl-md"
                          : "bg-neutral-100 text-neutral-800 rounded-bl-md"
                      }`}
                    >
                      {msg.body && <p>{msg.body}</p>}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-1.5 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div key={i} className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs ${msg.sender_type === "client" ? "bg-white/10" : d ? "bg-white/5" : "bg-neutral-200"}`}>
                              <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                              <span className="truncate">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className={`mt-1 text-[10px] ${msg.sender_type === "client" ? "text-red-200" : d ? "text-neutral-500" : "text-neutral-400"}`}>
                        {new Date(msg.criado_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className={`scroll-hide max-h-32 overflow-y-auto border-t px-4 py-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div key={att.id} className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${d ? "border-white/10 bg-neutral-800" : "border-neutral-200 bg-white"}`}>
                    <span className={`max-w-[140px] truncate ${d ? "text-neutral-300" : "text-neutral-600"}`}>{att.name}</span>
                    <button onClick={() => removeAttachment(att.id)} className="text-neutral-500 hover:text-red-500">
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`border-t p-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder="Escreva sua mensagem..."
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none transition ${d ? "border-white/10 bg-neutral-800 text-white placeholder:text-neutral-500 focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30" : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400 focus:border-red-500 focus:ring-1 focus:ring-red-200"}`}
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || (!message.trim() && attachments.length === 0)}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "..." : "Enviar"}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-4">
          <TabContent tab={activeTab} dark={d} />
        </main>
      </div>
    </div>
  );
}

function TabContent({ tab, dark: d }: { tab: TabId; dark: boolean }) {
  switch (tab) {
    case "pedidos":
      return <PedidosTab d={d} />;
    case "recompra":
      return <RecompraTab d={d} />;
    case "credit":
      return <CreditTab d={d} />;
    case "circular":
      return <CircularTab d={d} />;
    case "documentos":
      return <DocumentosTab d={d} />;
  }
}

function Card({ children, className = "", d, accent }: { children: React.ReactNode; className?: string; d: boolean; accent?: boolean }) {
  const base = accent
    ? "rounded-3xl p-5 shadow-lg shadow-red-900/30 bg-red-600 border border-red-500/30"
    : d
    ? "rounded-3xl p-5 border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/0 backdrop-blur-lg shadow-lg shadow-black/30"
    : "rounded-3xl p-5 border border-neutral-200 bg-white shadow-sm";
  return <section className={`${base} ${className}`}>{children}</section>;
}

type CartItem = { product_name: string; quantity: number; unit: string; unit_price: number; specifications: string };

const AVAILABLE_PRODUCTS = [
  { name: 'Rolo transportador', unit_price: 2800 },
  { name: 'Vedação NBR', unit_price: 450 },
  { name: 'Manta cerâmica', unit_price: 1200 },
  { name: 'Pé nivelador', unit_price: 180 },
  { name: 'Borracha anti-vibração', unit_price: 350 },
  { name: 'Junta de expansão', unit_price: 900 },
  { name: 'Revestimento de moega', unit_price: 3500 },
  { name: 'Raspador de correia', unit_price: 650 },
  { name: 'Outro (especificar)', unit_price: 0 },
];

function PedidosTab({ d }: { d: boolean }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentItem, setCurrentItem] = useState<CartItem>({ product_name: '', quantity: 1, unit: 'un', unit_price: 0, specifications: '' });
  const [addressType, setAddressType] = useState<'same' | 'new'>('same');
  const [newAddress, setNewAddress] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [profile, setProfile] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase.from('profiles').select('*').eq('id', data.user.id).single().then(({ data: p }) => setProfile(p));
      }
    });
  }, []);

  const addItemToCart = () => {
    if (!currentItem.product_name) return;
    setCart(prev => [...prev, { ...currentItem, unit_price: currentItem.unit_price || 0 }]);
    setCurrentItem({ product_name: '', quantity: 1, unit: 'un', unit_price: 0, specifications: '' });
  };

  const removeFromCart = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx));
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const address = addressType === 'same' ? (profile?.endereco_completo || '') : newAddress;

      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        client_id: userId,
        client_name: profile?.nome || '',
        client_email: profile?.email || '',
        client_phone: profile?.whatsapp || '',
        client_company: profile?.empresa || '',
        client_cpf_cnpj: profile?.cpf_cnpj || '',
        client_ie: profile?.inscricao_estadual || '',
        shipping_address: address,
        notes: priority === 'urgent' ? 'URGENTE' : null,
        status: 'pending',
        total_amount: cartTotal,
      }).select().single();

      if (orderErr) throw orderErr;

      const items = cart.map(item => ({
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        specifications: item.specifications ? { info: item.specifications } : null,
      }));
      await supabase.from('order_items').insert(items);

      // Notify in internal chat
      try {
        const conv = await getOrCreateConversation(userId!);
        const itemsList = cart.map(i => `${i.quantity}x ${i.product_name}`).join(', ');
        await sendMessage(conv.id, userId!, `📦 *${profile?.empresa || profile?.nome}* acabou de enviar um pedido. Confira o pedido para aprovação.\n\n🔗 Pedido N:${order.order_number || order.id.slice(0,8)}\nItens: ${itemsList}\nValor: R$ ${cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      } catch (chatErr) {
        console.error('Erro ao notificar chat:', chatErr);
      }

      setCart([]);
      setStep(1);
      setShowWizard(false);
      setPriority('normal');
      setAddressType('same');
      setNewAddress('');
      fetchOrders();
    } catch (err) {
      console.error('Erro ao criar pedido:', err);
    }
    setSubmitting(false);
  };

  const statusLabels: Record<string, string> = {
    pending: 'Aguardando aprovação',
    approved: 'Aprovado',
    in_vulcanization: 'Em vulcanização',
    in_production: 'Em produção',
    in_expedition: 'Em expedição',
    in_transit: 'Em rota de entrega',
    at_carrier: 'Na transportadora',
    delivered: 'Entregue',
    rejected: 'Rejeitado',
    cancelled: 'Cancelado',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    approved: 'bg-blue-500',
    in_vulcanization: 'bg-orange-500',
    in_production: 'bg-purple-500',
    in_expedition: 'bg-indigo-500',
    in_transit: 'bg-sky-500',
    at_carrier: 'bg-teal-500',
    delivered: 'bg-green-500',
    rejected: 'bg-red-500',
    cancelled: 'bg-red-400',
  };

  const activeOrders = orders.filter(o => !['delivered', 'rejected', 'cancelled'].includes(o.status));
  const lastOrder = orders[0];
  const stepLabels = ['Produtos', 'Entrega', 'Confirmação', 'Prazo'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Meus Pedidos</h2>
        <button
          onClick={() => { setShowWizard(!showWizard); setStep(1); setCart([]); }}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
        >
          {showWizard ? 'Cancelar' : 'Fazer Compra'}
        </button>
      </div>

      {/* Multi-step Purchase Wizard */}
      {showWizard && (
        <Card d={d} className="space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-2">
            {stepLabels.map((label, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 ${step === i + 1 ? '' : 'opacity-50'}`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-red-600 text-white' : d ? 'bg-neutral-700 text-neutral-400' : 'bg-neutral-200 text-neutral-500'}`}>{step > i + 1 ? '✓' : i + 1}</div>
                  <span className={`text-xs font-medium hidden sm:inline ${step === i + 1 ? (d ? 'text-white' : 'text-neutral-900') : (d ? 'text-neutral-500' : 'text-neutral-400')}`}>{label}</span>
                </div>
                {i < 3 && <div className={`w-6 h-px ${d ? 'bg-neutral-700' : 'bg-neutral-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Produtos */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Adicionar Produtos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className={`text-xs font-medium ${d ? "text-neutral-400" : "text-neutral-600"}`}>Produto *</label>
                  <select value={currentItem.product_name} onChange={e => { const p = AVAILABLE_PRODUCTS.find(x => x.name === e.target.value); setCurrentItem(c => ({ ...c, product_name: e.target.value, unit_price: p?.unit_price || 0 })); }} className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${d ? "border-white/10 bg-neutral-800 text-white" : "border-neutral-200 bg-white text-neutral-900"}`}>
                    <option value="">Selecione um produto...</option>
                    {AVAILABLE_PRODUCTS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-medium ${d ? "text-neutral-400" : "text-neutral-600"}`}>Quantidade</label>
                  <input type="number" min={1} value={currentItem.quantity} onChange={e => setCurrentItem(c => ({ ...c, quantity: parseInt(e.target.value) || 1 }))} className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${d ? "border-white/10 bg-neutral-800 text-white" : "border-neutral-200 bg-white text-neutral-900"}`} />
                </div>
                <div>
                  <label className={`text-xs font-medium ${d ? "text-neutral-400" : "text-neutral-600"}`}>Unidade</label>
                  <select value={currentItem.unit} onChange={e => setCurrentItem(c => ({ ...c, unit: e.target.value }))} className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${d ? "border-white/10 bg-neutral-800 text-white" : "border-neutral-200 bg-white text-neutral-900"}`}>
                    <option value="un">Unidade(s)</option>
                    <option value="m">Metro(s)</option>
                    <option value="kg">Kg</option>
                    <option value="rolo">Rolo(s)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={`text-xs font-medium ${d ? "text-neutral-400" : "text-neutral-600"}`}>Especificações</label>
                  <input type="text" value={currentItem.specifications} onChange={e => setCurrentItem(c => ({ ...c, specifications: e.target.value }))} placeholder="Dimensões, material, dureza..." className={`mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none ${d ? "border-white/10 bg-neutral-800 text-white placeholder:text-neutral-500" : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400"}`} />
                </div>
              </div>
              {currentItem.product_name && (
                <div className={`flex items-center justify-between rounded-xl px-4 py-2 ${d ? "bg-white/5 border border-white/10" : "bg-neutral-50 border border-neutral-100"}`}>
                  <span className={`text-sm ${d ? "text-neutral-300" : "text-neutral-700"}`}>Valor unitário: R$ {currentItem.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Total: R$ {(currentItem.quantity * currentItem.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <button onClick={addItemToCart} disabled={!currentItem.product_name} className={`w-full rounded-xl border py-2.5 text-sm font-medium transition ${d ? "border-white/10 text-neutral-200 hover:bg-white/5 disabled:opacity-30" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-30"}`}>+ Adicionar ao pedido</button>

              {cart.length > 0 && (
                <div className="space-y-2">
                  <p className={`text-xs font-medium ${d ? "text-neutral-400" : "text-neutral-600"}`}>Itens no pedido:</p>
                  {cart.map((item, i) => (
                    <div key={i} className={`flex items-center justify-between rounded-xl px-3 py-2 ${d ? "bg-white/5 border border-white/10" : "bg-neutral-50 border border-neutral-100"}`}>
                      <span className={`text-sm ${d ? "text-neutral-200" : "text-neutral-700"}`}>{item.quantity}x {item.product_name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${d ? "text-white" : "text-neutral-900"}`}>R$ {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <button onClick={() => removeFromCart(i)} className="text-red-500 text-xs hover:text-red-400">X</button>
                      </div>
                    </div>
                  ))}
                  <div className={`text-right text-sm font-bold pt-2 border-t ${d ? "border-white/10 text-white" : "border-neutral-200 text-neutral-900"}`}>Total: R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
              )}
              <button onClick={() => setStep(2)} disabled={cart.length === 0} className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50">Próximo: Entrega</button>
            </div>
          )}

          {/* Step 2: Entrega */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Endereço de Entrega</h3>
              <div className="flex gap-3">
                <button onClick={() => setAddressType('same')} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${addressType === 'same' ? 'bg-red-600 text-white border-red-600' : d ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>Mesmo endereço</button>
                <button onClick={() => setAddressType('new')} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${addressType === 'new' ? 'bg-red-600 text-white border-red-600' : d ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>Novo endereço</button>
              </div>
              {addressType === 'same' && profile?.endereco_completo && (
                <div className={`rounded-xl px-4 py-3 ${d ? "bg-white/5 border border-white/10" : "bg-neutral-50 border border-neutral-100"}`}>
                  <p className={`text-xs ${d ? "text-neutral-400" : "text-neutral-600"}`}>Endereço cadastrado:</p>
                  <p className={`text-sm mt-1 ${d ? "text-white" : "text-neutral-900"}`}>{profile.endereco_completo}</p>
                </div>
              )}
              {addressType === 'same' && !profile?.endereco_completo && (
                <div className={`rounded-xl px-4 py-3 ${d ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-yellow-50 border border-yellow-200"}`}>
                  <p className={`text-xs text-yellow-600`}>Nenhum endereço cadastrado. Por favor, informe um novo endereço.</p>
                </div>
              )}
              {(addressType === 'new' || (addressType === 'same' && !profile?.endereco_completo)) && (
                <textarea value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Rua, número, complemento, bairro, cidade, estado, CEP..." rows={3} className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-none ${d ? "border-white/10 bg-neutral-800 text-white placeholder:text-neutral-500" : "border-neutral-200 bg-white text-neutral-900 placeholder:text-neutral-400"}`} />
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${d ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>Voltar</button>
                <button onClick={() => setStep(3)} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500">Próximo: Confirmação</button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmação (NF preview) */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Confirmação do Pedido</h3>
              <div className={`rounded-xl border p-4 space-y-3 ${d ? "border-white/10 bg-white/[0.03]" : "border-neutral-200 bg-neutral-50"}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider ${d ? "text-neutral-500" : "text-neutral-400"}`}>Comprador</p>
                    <p className={`text-sm font-medium ${d ? "text-white" : "text-neutral-900"}`}>{profile?.nome || '—'}</p>
                    <p className={`text-xs ${d ? "text-neutral-400" : "text-neutral-600"}`}>{profile?.empresa || ''}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] uppercase tracking-wider ${d ? "text-neutral-500" : "text-neutral-400"}`}>CNPJ</p>
                    <p className={`text-sm ${d ? "text-neutral-300" : "text-neutral-700"}`}>{profile?.cpf_cnpj || 'Não informado'}</p>
                  </div>
                </div>
                <div className={`border-t pt-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-2 ${d ? "text-neutral-500" : "text-neutral-400"}`}>Itens</p>
                  <table className="w-full text-xs">
                    <thead><tr className={d ? "text-neutral-400" : "text-neutral-500"}><th className="text-left py-1">Produto</th><th className="text-center py-1">Qtd</th><th className="text-right py-1">Unit.</th><th className="text-right py-1">Total</th></tr></thead>
                    <tbody>
                      {cart.map((item, i) => (
                        <tr key={i} className={d ? "text-neutral-200" : "text-neutral-700"}>
                          <td className="py-1">{item.product_name}</td>
                          <td className="text-center py-1">{item.quantity} {item.unit}</td>
                          <td className="text-right py-1">R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          <td className="text-right py-1 font-medium">R$ {(item.quantity * item.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={`border-t pt-2 flex justify-between ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <span className={`text-sm font-bold ${d ? "text-white" : "text-neutral-900"}`}>Total</span>
                  <span className={`text-sm font-bold ${d ? "text-white" : "text-neutral-900"}`}>R$ {cartTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={`border-t pt-2 ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <p className={`text-[10px] uppercase tracking-wider ${d ? "text-neutral-500" : "text-neutral-400"}`}>Entrega</p>
                  <p className={`text-xs mt-1 ${d ? "text-neutral-300" : "text-neutral-700"}`}>{addressType === 'same' ? (profile?.endereco_completo || newAddress || 'Não informado') : (newAddress || 'Não informado')}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${d ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>Voltar</button>
                <button onClick={() => setStep(4)} className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500">Próximo: Prazo</button>
              </div>
            </div>
          )}

          {/* Step 4: Prazo */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Prazo de Entrega</h3>
              <p className={`text-xs ${d ? "text-neutral-400" : "text-neutral-600"}`}>Selecione a urgência do seu pedido:</p>
              <div className="flex gap-3">
                <button onClick={() => setPriority('urgent')} className={`flex-1 rounded-xl border py-4 text-center transition ${priority === 'urgent' ? 'bg-orange-500 text-white border-orange-500' : d ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                  <span className="block text-lg mb-1">{'⚡'}</span>
                  <span className="text-sm font-semibold">URGÊNCIA</span>
                  <span className={`block text-[10px] mt-1 ${priority === 'urgent' ? 'text-orange-100' : d ? 'text-neutral-500' : 'text-neutral-500'}`}>Prioridade máxima</span>
                </button>
                <button onClick={() => setPriority('normal')} className={`flex-1 rounded-xl border py-4 text-center transition ${priority === 'normal' ? 'bg-blue-500 text-white border-blue-500' : d ? 'border-white/10 text-neutral-300 hover:bg-white/5' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'}`}>
                  <span className="block text-lg mb-1">{'\u{1F4E6}'}</span>
                  <span className="text-sm font-semibold">NORMAL</span>
                  <span className={`block text-[10px] mt-1 ${priority === 'normal' ? 'text-blue-100' : d ? 'text-neutral-500' : 'text-neutral-500'}`}>Prazo padrão</span>
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(3)} className={`flex-1 rounded-xl border py-3 text-sm font-medium transition ${d ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>Voltar</button>
                <button onClick={handleConfirmOrder} disabled={submitting} className="flex-1 rounded-xl bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-500 disabled:opacity-50">
                  {submitting ? 'Enviando...' : 'CONFIRMAR COMPRA'}
                </button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card d={d} accent className="min-h-[120px] flex flex-col justify-between">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-100/80">Último pedido</p>
          <p className="text-[17px] leading-snug font-semibold text-white">
            {lastOrder?.order_items?.[0]?.product_name || 'Nenhum pedido'}
          </p>
          {lastOrder && (
            <div className="flex items-center gap-2 text-xs text-red-100/80 pt-2 border-t border-white/20 mt-2">
              <div className={`h-2 w-2 rounded-full ${statusColors[lastOrder.status] || 'bg-gray-400'}`}></div>
              <span>{statusLabels[lastOrder.status] || lastOrder.status}</span>
            </div>
          )}
        </Card>
        <Card d={d} className="min-h-[120px] flex flex-col justify-between">
          <p className={`text-xs ${d ? "text-neutral-400" : "text-neutral-700"}`}>Pedidos ativos</p>
          <p className={`text-[28px] font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>{activeOrders.length}</p>
        </Card>
        <Card d={d} className="min-h-[120px] flex flex-col justify-between">
          <p className={`text-xs ${d ? "text-neutral-400" : "text-neutral-700"}`}>Total de pedidos</p>
          <p className={`text-[28px] font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>{orders.length}</p>
        </Card>
      </div>

      {/* Orders List */}
      <Card d={d} className="min-h-[200px]">
        <div className="mb-3">
          <h3 className={`text-sm font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Histórico de pedidos</h3>
        </div>
        {loading ? (
          <p className={`text-sm ${d ? "text-neutral-500" : "text-neutral-600"}`}>Carregando...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-sm ${d ? "text-neutral-500" : "text-neutral-600"}`}>Nenhum pedido realizado ainda.</p>
            <p className={`text-xs mt-1 ${d ? "text-neutral-600" : "text-neutral-500"}`}>Clique em "Fazer Compra" para começar.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <div
                key={order.id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 ${d ? "bg-white/5 border border-white/10" : "bg-neutral-50 border border-neutral-100"}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${statusColors[order.status] || 'bg-gray-400'}`}></div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${d ? "text-neutral-200" : "text-neutral-700"}`}>
                      <span className="font-mono text-xs text-red-500 mr-2">N:{order.order_number || '—'}</span>
                      {order.order_items?.[0]?.product_name || 'Pedido'}
                      {order.order_items?.length > 1 && ` +${order.order_items.length - 1}`}
                    </p>
                    <p className={`text-[11px] ${d ? "text-neutral-500" : "text-neutral-600"}`}>
                      {order.order_items?.[0]?.quantity} {order.order_items?.[0]?.unit} · {statusLabels[order.status] || order.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${d ? "bg-white/10 text-neutral-200 hover:bg-white/15 border border-white/10" : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 border border-neutral-300"}`}
                  >
                    Detalhe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div onClick={e => e.stopPropagation()} className={`relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl ${d ? "bg-neutral-900 border-white/10" : "bg-white border-neutral-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-bold ${d ? "text-white" : "text-neutral-900"}`}>Pedido N:{selectedOrder.order_number || '—'}</h3>
              <button onClick={() => setSelectedOrder(null)} className={`h-8 w-8 flex items-center justify-center rounded-lg ${d ? "hover:bg-white/10 text-neutral-400" : "hover:bg-neutral-100 text-neutral-500"}`}>✕</button>
            </div>

            {/* Download / Print buttons */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  const items = selectedOrder.order_items || [];
                  const certs = selectedOrder.certificates || [];
                  const pw = window.open('', '_blank');
                  if (!pw) return;
                  pw.document.write(`<html><head><title>Pedido N:${selectedOrder.order_number || ''}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1a1a1a}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #dc2626}.logo{font-size:22px;font-weight:800;color:#dc2626}.meta{text-align:right;font-size:11px;color:#666}.meta strong{color:#1a1a1a}.section{margin:16px 0}.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{margin-bottom:6px}.field-label{font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#888}.field-value{font-size:12px;font-weight:500}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #e5e5e5;padding:8px;text-align:left;font-size:11px}th{background:#f9f9f9;font-weight:600;text-transform:uppercase;font-size:9px}.total-row{font-weight:700;background:#fef2f2}.nf-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin:12px 0}.cert-item{display:inline-block;padding:4px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;margin:3px 4px 3px 0;font-size:10px}.footer{margin-top:30px;padding-top:12px;border-top:1px solid #eee;font-size:9px;color:#888;text-align:center}@media print{body{padding:20px}}</style></head><body><div class="header"><div><div class="logo">FerriBor</div><p style="font-size:10px;color:#666;margin-top:2px">Artefatos de Borracha</p></div><div class="meta"><p><strong>Pedido N:${selectedOrder.order_number || ''}</strong></p><p>Data: ${new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}</p><p>Status: ${statusLabels[selectedOrder.status] || selectedOrder.status}</p>${selectedOrder.lote ? `<p>LOTE: <strong>${selectedOrder.lote}</strong></p>` : ''}</div></div>${selectedOrder.nf_number ? `<div class="nf-box"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;margin-bottom:6px">Nota Fiscal</div><div class="grid"><div class="field"><div class="field-label">Numero NF</div><div class="field-value">${selectedOrder.nf_number}</div></div><div class="field"><div class="field-label">Serie</div><div class="field-value">${selectedOrder.nf_serie || '001'}</div></div>${selectedOrder.nf_access_key ? `<div class="field" style="grid-column:1/-1"><div class="field-label">Chave de Acesso</div><div class="field-value" style="font-family:monospace;font-size:10px">${selectedOrder.nf_access_key}</div></div>` : ''}</div></div>` : ''}<div class="section"><div class="section-title">Emitente</div><div class="grid"><div class="field"><div class="field-label">Razao Social</div><div class="field-value">Ferri Fabricacao de Artefatos de Borracha Ltda</div></div><div class="field"><div class="field-label">CNPJ</div><div class="field-value">20.036.263/0001-68</div></div><div class="field"><div class="field-label">Municipio/UF</div><div class="field-value">Santa Gertrudes / SP</div></div><div class="field"><div class="field-label">CNAE</div><div class="field-value">2219-6/00</div></div></div></div><div class="section"><div class="section-title">Destinatario</div><div class="grid"><div class="field"><div class="field-label">Nome</div><div class="field-value">${selectedOrder.client_name || ''}</div></div><div class="field"><div class="field-label">Empresa</div><div class="field-value">${selectedOrder.client_company || ''}</div></div><div class="field"><div class="field-label">CNPJ/CPF</div><div class="field-value">${selectedOrder.client_cpf_cnpj || ''}</div></div><div class="field"><div class="field-label">IE</div><div class="field-value">${selectedOrder.client_ie || ''}</div></div><div class="field" style="grid-column:1/-1"><div class="field-label">Endereco</div><div class="field-value">${selectedOrder.shipping_address || ''}</div></div></div></div><div class="section"><div class="section-title">Itens</div><table><thead><tr><th>Produto</th><th>Qtd</th><th>Un.</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${items.map((i: any) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>R$ ${Number(i.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>R$ ${Number(i.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('')}<tr class="total-row"><td colspan="4" style="text-align:right">TOTAL</td><td>R$ ${Number(selectedOrder.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr></tbody></table></div>${certs.length > 0 ? `<div class="section"><div class="section-title">Certificados</div>${certs.map((c: any) => `<span class="cert-item">✓ ${c.name} (${c.type})</span>`).join('')}</div>` : ''}${selectedOrder.notes ? `<div class="section"><div class="section-title">Observacoes</div><p style="font-size:12px">${selectedOrder.notes}</p></div>` : ''}<div class="footer"><p>Documento gerado pelo sistema FerriBor Global 4.0</p></div><script>window.print();</script></body></html>`);
                  pw.document.close();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${d ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Baixar PDF
              </button>
              <button
                onClick={() => {
                  const items = selectedOrder.order_items || [];
                  const certs = selectedOrder.certificates || [];
                  const pw = window.open('', '_blank');
                  if (!pw) return;
                  pw.document.write(`<html><head><title>Pedido N:${selectedOrder.order_number || ''}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#1a1a1a}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #dc2626}.logo{font-size:22px;font-weight:800;color:#dc2626}.meta{text-align:right;font-size:11px;color:#666}.meta strong{color:#1a1a1a}.section{margin:16px 0}.section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#dc2626;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid #eee}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{margin-bottom:6px}.field-label{font-size:9px;text-transform:uppercase;letter-spacing:0.5px;color:#888}.field-value{font-size:12px;font-weight:500}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{border:1px solid #e5e5e5;padding:8px;text-align:left;font-size:11px}th{background:#f9f9f9;font-weight:600;text-transform:uppercase;font-size:9px}.total-row{font-weight:700;background:#fef2f2}.nf-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin:12px 0}.cert-item{display:inline-block;padding:4px 10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;margin:3px 4px 3px 0;font-size:10px}.footer{margin-top:30px;padding-top:12px;border-top:1px solid #eee;font-size:9px;color:#888;text-align:center}@media print{body{padding:20px}}</style></head><body><div class="header"><div><div class="logo">FerriBor</div><p style="font-size:10px;color:#666;margin-top:2px">Artefatos de Borracha</p></div><div class="meta"><p><strong>Pedido N:${selectedOrder.order_number || ''}</strong></p><p>Data: ${new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}</p><p>Status: ${statusLabels[selectedOrder.status] || selectedOrder.status}</p>${selectedOrder.lote ? `<p>LOTE: <strong>${selectedOrder.lote}</strong></p>` : ''}</div></div>${selectedOrder.nf_number ? `<div class="nf-box"><div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#475569;margin-bottom:6px">Nota Fiscal</div><div class="grid"><div class="field"><div class="field-label">Numero NF</div><div class="field-value">${selectedOrder.nf_number}</div></div><div class="field"><div class="field-label">Serie</div><div class="field-value">${selectedOrder.nf_serie || '001'}</div></div>${selectedOrder.nf_access_key ? `<div class="field" style="grid-column:1/-1"><div class="field-label">Chave de Acesso</div><div class="field-value" style="font-family:monospace;font-size:10px">${selectedOrder.nf_access_key}</div></div>` : ''}</div></div>` : ''}<div class="section"><div class="section-title">Emitente</div><div class="grid"><div class="field"><div class="field-label">Razao Social</div><div class="field-value">Ferri Fabricacao de Artefatos de Borracha Ltda</div></div><div class="field"><div class="field-label">CNPJ</div><div class="field-value">20.036.263/0001-68</div></div><div class="field"><div class="field-label">Municipio/UF</div><div class="field-value">Santa Gertrudes / SP</div></div><div class="field"><div class="field-label">CNAE</div><div class="field-value">2219-6/00</div></div></div></div><div class="section"><div class="section-title">Destinatario</div><div class="grid"><div class="field"><div class="field-label">Nome</div><div class="field-value">${selectedOrder.client_name || ''}</div></div><div class="field"><div class="field-label">Empresa</div><div class="field-value">${selectedOrder.client_company || ''}</div></div><div class="field"><div class="field-label">CNPJ/CPF</div><div class="field-value">${selectedOrder.client_cpf_cnpj || ''}</div></div><div class="field"><div class="field-label">IE</div><div class="field-value">${selectedOrder.client_ie || ''}</div></div><div class="field" style="grid-column:1/-1"><div class="field-label">Endereco</div><div class="field-value">${selectedOrder.shipping_address || ''}</div></div></div></div><div class="section"><div class="section-title">Itens</div><table><thead><tr><th>Produto</th><th>Qtd</th><th>Un.</th><th>Valor Unit.</th><th>Total</th></tr></thead><tbody>${items.map((i: any) => `<tr><td>${i.product_name}</td><td>${i.quantity}</td><td>${i.unit}</td><td>R$ ${Number(i.unit_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td>R$ ${Number(i.total_price || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('')}<tr class="total-row"><td colspan="4" style="text-align:right">TOTAL</td><td>R$ ${Number(selectedOrder.total_amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr></tbody></table></div>${certs.length > 0 ? `<div class="section"><div class="section-title">Certificados</div>${certs.map((c: any) => `<span class="cert-item">✓ ${c.name} (${c.type})</span>`).join('')}</div>` : ''}${selectedOrder.notes ? `<div class="section"><div class="section-title">Observacoes</div><p style="font-size:12px">${selectedOrder.notes}</p></div>` : ''}<div class="footer"><p>Documento gerado pelo sistema FerriBor Global 4.0</p></div><script>window.print();</script></body></html>`);
                  pw.document.close();
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition ${d ? "border-white/10 text-neutral-300 hover:bg-white/5" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Imprimir pedido
              </button>
            </div>
            <div className={`rounded-xl border p-4 space-y-3 ${d ? "border-white/10 bg-white/[0.03]" : "border-neutral-200 bg-neutral-50"}`}>
              <div className="flex justify-between items-center">
                <span className={`text-xs ${d ? "text-neutral-400" : "text-neutral-600"}`}>Status</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d ? "bg-white/10 text-white" : "bg-neutral-200 text-neutral-800"}`}>{statusLabels[selectedOrder.status] || selectedOrder.status}</span>
              </div>
              <div className={`border-t pt-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
                <p className={`text-[10px] uppercase tracking-wider mb-2 ${d ? "text-neutral-500" : "text-neutral-400"}`}>Itens</p>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item: any, i: number) => (
                    <div key={i} className={`flex items-center justify-between text-sm ${d ? "text-neutral-200" : "text-neutral-700"}`}>
                      <span>{item.quantity} {item.unit} - {item.product_name}</span>
                      {item.total_price && <span className="font-medium">R$ {Number(item.total_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>}
                    </div>
                  ))}
                </div>
              </div>
              {selectedOrder.total_amount && (
                <div className={`border-t pt-2 flex justify-between ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <span className={`text-sm font-bold ${d ? "text-white" : "text-neutral-900"}`}>Total</span>
                  <span className={`text-sm font-bold ${d ? "text-white" : "text-neutral-900"}`}>R$ {Number(selectedOrder.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className={`border-t pt-2 space-y-1 ${d ? "border-white/10" : "border-neutral-200"}`}>
                <div className="flex justify-between text-xs">
                  <span className={d ? "text-neutral-400" : "text-neutral-600"}>Data</span>
                  <span className={d ? "text-neutral-200" : "text-neutral-700"}>{new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {selectedOrder.shipping_address && (
                  <div className="flex justify-between text-xs">
                    <span className={d ? "text-neutral-400" : "text-neutral-600"}>Entrega</span>
                    <span className={`text-right max-w-[60%] ${d ? "text-neutral-200" : "text-neutral-700"}`}>{selectedOrder.shipping_address}</span>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="flex justify-between text-xs">
                    <span className={d ? "text-neutral-400" : "text-neutral-600"}>Obs</span>
                    <span className={d ? "text-neutral-200" : "text-neutral-700"}>{selectedOrder.notes}</span>
                  </div>
                )}
                {selectedOrder.lote && (
                  <div className="flex justify-between text-xs">
                    <span className={d ? "text-neutral-400" : "text-neutral-600"}>LOTE</span>
                    <span className={`font-mono font-bold ${d ? "text-neutral-200" : "text-neutral-700"}`}>{selectedOrder.lote}</span>
                  </div>
                )}
              </div>

              {/* Nota Fiscal */}
              {selectedOrder.nf_number && (
                <div className={`border-t pt-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-2 ${d ? "text-neutral-500" : "text-neutral-400"}`}>Nota Fiscal</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={d ? "text-neutral-400" : "text-neutral-600"}>Número NF</span>
                      <span className={`font-mono ${d ? "text-neutral-200" : "text-neutral-700"}`}>{selectedOrder.nf_number}</span>
                    </div>
                    {selectedOrder.nf_serie && (
                      <div className="flex justify-between text-xs">
                        <span className={d ? "text-neutral-400" : "text-neutral-600"}>Série</span>
                        <span className={d ? "text-neutral-200" : "text-neutral-700"}>{selectedOrder.nf_serie}</span>
                      </div>
                    )}
                    {selectedOrder.nf_access_key && (
                      <div className="flex justify-between text-xs">
                        <span className={d ? "text-neutral-400" : "text-neutral-600"}>Chave de Acesso</span>
                        <span className={`font-mono text-[10px] ${d ? "text-neutral-300" : "text-neutral-600"}`}>{selectedOrder.nf_access_key}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emitente */}
              <div className={`border-t pt-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
                <p className={`text-[10px] uppercase tracking-wider mb-2 ${d ? "text-neutral-500" : "text-neutral-400"}`}>Emitente</p>
                <div className="space-y-0.5">
                  <p className={`text-xs font-medium ${d ? "text-neutral-200" : "text-neutral-700"}`}>Ferri Fabricação de Artefatos de Borracha Ltda</p>
                  <p className={`text-[11px] ${d ? "text-neutral-400" : "text-neutral-500"}`}>CNPJ: 20.036.263/0001-68</p>
                  <p className={`text-[11px] ${d ? "text-neutral-400" : "text-neutral-500"}`}>Santa Gertrudes / SP</p>
                </div>
              </div>

              {/* Certificados */}
              {selectedOrder.certificates && selectedOrder.certificates.length > 0 && (
                <div className={`border-t pt-3 ${d ? "border-white/10" : "border-neutral-200"}`}>
                  <p className={`text-[10px] uppercase tracking-wider mb-2 ${d ? "text-neutral-500" : "text-neutral-400"}`}>Certificados</p>
                  <div className="space-y-1.5">
                    {selectedOrder.certificates.map((cert: any, i: number) => (
                      <a key={i} href={cert.url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition ${d ? "bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10" : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-200"}`}>
                        <span className="text-green-500">✓</span>
                        <span>{cert.name}</span>
                        <span className={`ml-auto text-[10px] ${d ? "text-neutral-500" : "text-neutral-400"}`}>{cert.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecompraTab({ d }: { d: boolean }) {
  const [view, setView] = useState<"home" | "list" | "form">("home");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [formItems, setFormItems] = useState<{ product_name: string; quantity: number; unit: string }[]>([]);
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
    setView("list");
  };

  const startRecompra = (order: any) => {
    setSelectedOrder(order);
    const items = (order.order_items || order.items || []).map((i: any) => ({
      product_name: i.product_name,
      quantity: i.quantity,
      unit: i.unit || "un",
    }));
    setFormItems(items);
    setDeadline("");
    setView("form");
  };

  const updateItem = (idx: number, field: string, value: any) => {
    setFormItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const removeItem = (idx: number) => {
    setFormItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addItem = () => {
    setFormItems((prev) => [...prev, { product_name: "", quantity: 1, unit: "un" }]);
  };

  const handleSubmit = async () => {
    if (formItems.length === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("orders").insert({
      client_id: selectedOrder.client_id,
      client_name: selectedOrder.client_name,
      client_company: selectedOrder.client_company,
      client_cpf_cnpj: selectedOrder.client_cpf_cnpj,
      client_email: selectedOrder.client_email,
      client_phone: selectedOrder.client_phone,
      shipping_address: selectedOrder.shipping_address,
      status: "pending",
      delivery_deadline: deadline || null,
      notes: `Recompra do pedido #${selectedOrder.order_number || selectedOrder.id.slice(0, 8)}`,
    });
    if (!error) {
      setView("home");
      setSelectedOrder(null);
    }
    setSubmitting(false);
  };

  if (view === "list") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${d ? "text-white" : "text-neutral-900"}`}>Pedidos disponíveis para recompra</h2>
          <button onClick={() => setView("home")} className={`text-xs ${d ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"} transition`}>
            ← Voltar
          </button>
        </div>
        {loading ? (
          <p className={`text-sm ${d ? "text-neutral-500" : "text-neutral-600"}`}>Carregando pedidos...</p>
        ) : orders.length === 0 ? (
          <p className={`text-sm ${d ? "text-neutral-500" : "text-neutral-600"}`}>Nenhum pedido encontrado.</p>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.id} className={`flex items-center justify-between rounded-xl border px-4 py-3 ${d ? "border-white/10 bg-white/[0.03]" : "border-neutral-200 bg-neutral-50"}`}>
                <div>
                  <p className={`text-sm font-medium ${d ? "text-white" : "text-neutral-900"}`}>
                    Pedido #{order.order_number || order.id.slice(0, 8)}
                  </p>
                  <p className={`text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>
                    {(order.order_items || []).length} itens · {new Date(order.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => startRecompra(order)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-500"
                >
                  Recompra
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (view === "form" && selectedOrder) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-semibold ${d ? "text-white" : "text-neutral-900"}`}>
            Recompra — Pedido #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}
          </h2>
          <button onClick={() => setView("list")} className={`text-xs ${d ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"} transition`}>
            ← Voltar
          </button>
        </div>

        <div className={`rounded-xl border p-4 ${d ? "border-white/10 bg-white/[0.03]" : "border-neutral-200 bg-neutral-50"}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${d ? "text-neutral-400" : "text-neutral-600"}`}>Itens do pedido</p>
          <div className="space-y-2">
            {formItems.map((item, idx) => (
              <div key={idx} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${d ? "border-white/10 bg-white/[0.02]" : "border-neutral-200 bg-white"}`}>
                <input
                  value={item.product_name}
                  onChange={(e) => updateItem(idx, "product_name", e.target.value)}
                  placeholder="Nome do produto"
                  className={`flex-1 bg-transparent text-sm outline-none ${d ? "text-white placeholder-neutral-600" : "text-neutral-900 placeholder-neutral-400"}`}
                />
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                  className={`w-16 rounded-md border px-2 py-1 text-center text-sm outline-none ${d ? "border-white/10 bg-white/5 text-white" : "border-neutral-200 bg-neutral-100 text-neutral-900"}`}
                />
                <input
                  value={item.unit}
                  onChange={(e) => updateItem(idx, "unit", e.target.value)}
                  className={`w-14 rounded-md border px-2 py-1 text-center text-xs outline-none ${d ? "border-white/10 bg-white/5 text-white" : "border-neutral-200 bg-neutral-100 text-neutral-900"}`}
                />
                <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 text-sm">✕</button>
              </div>
            ))}
          </div>
          <button onClick={addItem} className={`mt-2 text-xs ${d ? "text-neutral-400 hover:text-white" : "text-neutral-600 hover:text-neutral-900"} transition`}>
            + Adicionar item
          </button>
        </div>

        <div className={`rounded-xl border p-4 ${d ? "border-white/10 bg-white/[0.03]" : "border-neutral-200 bg-neutral-50"}`}>
          <label className={`text-xs font-medium uppercase tracking-wide ${d ? "text-neutral-400" : "text-neutral-600"}`}>Prazo de entrega</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className={`mt-2 w-full rounded-lg border px-3 py-2 text-sm outline-none ${d ? "border-white/10 bg-white/5 text-white" : "border-neutral-200 bg-white text-neutral-900"}`}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting || formItems.length === 0}
          className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Confirmar Recompra"}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-8 lg:grid-cols-12">
      <Card d={d} accent className="md:col-span-8 lg:col-span-6 min-h-[240px] flex flex-col justify-between">
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-red-100/80">Recompra inteligente</p>
          <h2 className="text-[22px] font-semibold tracking-tight text-white">Alertas de desgaste</h2>
        </div>
        <p className="text-sm text-red-100/80 border-b border-white/20 pb-3 mb-3">Peças chegando ao fim da vida útil estimada.</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl bg-white/10 border border-white/20 px-3 py-2.5">
            <span className="text-sm text-white">Rolo transportador 800mm</span>
            <span className="rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] text-white">Substituir em breve</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-white/10 border border-white/20 px-3 py-2.5">
            <span className="text-sm text-white">Vedação silicone ø120mm</span>
            <span className="rounded-full bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] text-white">~30 dias</span>
          </div>
        </div>
      </Card>

      <Card d={d} className="md:col-span-4 lg:col-span-6 min-h-[240px] flex flex-col justify-between">
        <div className="mb-3">
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Ação rápida</p>
          <h2 className={`text-lg font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>Recomprar pedido anterior</h2>
        </div>
        <p className={`text-xs mb-4 ${d ? "text-neutral-500" : "text-neutral-600"}`}>Selecione um pedido anterior para recompra com 1 clique.</p>
        <button onClick={fetchOrders} className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500">
          Ver pedidos disponíveis
        </button>
      </Card>
    </div>
  );
}

function CreditTab({ d }: { d: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-8 lg:grid-cols-12">
      <Card d={d} className={`md:col-span-4 lg:col-span-5 min-h-[220px] flex flex-col justify-between ${!d ? "" : "!bg-white !border-neutral-200"}`}>
        <div className="mb-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">Saldo</p>
          <h2 className="text-[28px] font-semibold tracking-tight text-neutral-900">1.240 créditos</h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Compras recorrentes</span>
            <span className="font-medium text-neutral-900">+80</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Indicações</span>
            <span className="font-medium text-neutral-900">+200</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">Programa ESG</span>
            <span className="font-medium text-neutral-900">+160</span>
          </div>
        </div>
      </Card>

      <Card d={d} className="md:col-span-4 lg:col-span-4 min-h-[220px] flex flex-col justify-between">
        <div className="mb-3">
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Ranking</p>
          <h2 className={`text-lg font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>Sua posição</h2>
        </div>
        <div className={`flex items-center gap-3 rounded-xl p-4 ${d ? "bg-white/5 border border-white/10" : "bg-neutral-50 border border-neutral-100"}`}>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white font-bold text-lg">#4</div>
          <div>
            <p className={`text-sm font-medium ${d ? "text-neutral-200" : "text-neutral-800"}`}>Top 10%</p>
            <p className={`text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>Entre os clientes ativos</p>
          </div>
        </div>
        <button className={`mt-4 w-full rounded-xl border py-2.5 text-sm font-medium transition ${d ? "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>
          Resgatar créditos
        </button>
      </Card>

      <Card d={d} className="md:col-span-8 lg:col-span-3 min-h-[220px] flex flex-col justify-between">
        <div className="mb-3">
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Benefícios</p>
        </div>
        <div className="space-y-2 flex-1">
          {["Desconto em compras", "Manutenção preventiva", "Consultoria técnica"].map((b, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition ${d ? "text-neutral-300 hover:bg-white/5" : "text-neutral-600 hover:bg-neutral-50"}`}>
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              {b}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CircularTab({ d }: { d: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-8 lg:grid-cols-12">
      <Card d={d} className={`md:col-span-4 lg:col-span-6 min-h-[240px] flex flex-col justify-between ${d ? "!bg-neutral-900 !border-white/10" : ""}`}>
        <div className="mb-4">
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Logística reversa</p>
          <h2 className={`text-[22px] font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>FerriBor Circular</h2>
        </div>
        <p className={`text-sm mb-4 ${d ? "text-neutral-400" : "text-neutral-700"}`}>Solicite coleta de peças usadas e acumule créditos ESG.</p>
        <button className="w-full rounded-xl bg-red-600 py-3 text-sm font-medium text-white transition hover:bg-red-500">Solicitar coleta</button>
      </Card>

      <Card d={d} className="md:col-span-4 lg:col-span-6 min-h-[240px] flex flex-col justify-between">
        <div className="mb-3">
          <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Impacto ambiental</p>
          <h2 className={`text-lg font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>Certificado ESG</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className={`text-sm ${d ? "text-neutral-400" : "text-neutral-700"}`}>Borracha desviada de aterros</span>
            <span className={`text-sm font-medium ${d ? "text-white" : "text-neutral-900"}`}>320 kg</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${d ? "text-neutral-400" : "text-neutral-700"}`}>CO₂ economizado</span>
            <span className={`text-sm font-medium ${d ? "text-white" : "text-neutral-900"}`}>1.2 ton</span>
          </div>
          <div className={`w-full rounded-full h-2 mt-2 ${d ? "bg-neutral-800" : "bg-neutral-200"}`}>
            <div className="h-2 rounded-full bg-red-600" style={{ width: "68%" }}></div>
          </div>
          <p className={`text-[11px] ${d ? "text-neutral-500" : "text-neutral-600"}`}>68% do objetivo anual atingido</p>
        </div>
        <button className={`mt-4 w-full rounded-xl border py-2.5 text-sm font-medium transition ${d ? "border-white/10 bg-white/5 text-neutral-200 hover:bg-white/10" : "border-neutral-200 text-neutral-700 hover:bg-neutral-50"}`}>
          Baixar certificado PDF
        </button>
      </Card>
    </div>
  );
}

function DocumentosTab({ d }: { d: boolean }) {
  const docs = [
    { name: "NF-e 001247", type: "Nota Fiscal", date: "Jun 20, 2026" },
    { name: "Certificado de qualidade - Lote 89", type: "Certificado", date: "Jun 18, 2026" },
    { name: "Laudo técnico - Vedação NBR", type: "Laudo", date: "Jun 15, 2026" },
    { name: "NF-e 001233", type: "Nota Fiscal", date: "Jun 10, 2026" },
    { name: "Certificado ESG - Q2 2026", type: "ESG", date: "Jun 01, 2026" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card d={d} className="min-h-[300px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className={`text-xs font-medium uppercase tracking-[0.14em] ${d ? "text-neutral-400" : "text-neutral-700"}`}>Central de documentos</p>
            <h2 className={`text-lg font-semibold tracking-tight ${d ? "text-white" : "text-neutral-900"}`}>Notas fiscais, certificados e laudos</h2>
          </div>
          <button className={`rounded-full border px-3 py-1.5 text-[11px] transition ${d ? "bg-neutral-800 border-white/10 text-neutral-200 hover:bg-neutral-700" : "bg-neutral-100 border-neutral-200 text-neutral-600 hover:bg-neutral-200"}`}>
            Filtrar
          </button>
        </div>
        <div className="space-y-2 flex-1">
          {docs.map((doc, i) => (
            <div
              key={i}
              draggable="true"
              onDragStart={(e) => e.dataTransfer.setData("text/plain", `[Doc: ${doc.name}]`)}
              className={`flex items-center justify-between rounded-xl px-4 py-3 transition cursor-grab active:cursor-grabbing ${d ? "bg-white/5 border border-white/10 hover:bg-white/[0.08]" : "bg-neutral-50 border border-neutral-100 hover:bg-neutral-100"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${d ? "bg-red-600/20 border border-red-500/20" : "bg-red-50 border border-red-100"}`}>
                  <svg className={`h-4 w-4 ${d ? "text-red-400" : "text-red-500"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-medium ${d ? "text-neutral-200" : "text-neutral-700"}`}>{doc.name}</p>
                  <p className={`text-[11px] ${d ? "text-neutral-500" : "text-neutral-600"}`}>{doc.type}</p>
                </div>
              </div>
              <span className={`text-xs ${d ? "text-neutral-500" : "text-neutral-600"}`}>{doc.date}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
