import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Conversation = {
  id: string;
  client_id: string;
  status: string;
  subject: string | null;
  criado_em: string;
  atualizado_em: string;
  client_nome?: string;
  client_email?: string;
};

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'client' | 'staff';
  body: string | null;
  attachments: { name: string; type: string; url?: string }[];
  criado_em: string;
};

export function PortalInbox() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);

    const channel = supabase
      .channel(`portal-msgs:${selectedId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${selectedId}`,
      }, (payload) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === (payload.new as Message).id)) return prev;
          return [...prev, payload.new as Message];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('atualizado_em', { ascending: false });

    if (!data) return;

    const convs: Conversation[] = [];
    for (const c of data) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, email')
        .eq('id', c.client_id)
        .single();
      convs.push({
        ...c,
        client_nome: profile?.nome || 'Cliente',
        client_email: profile?.email || '',
      });
    }
    setConversations(convs);
    if (convs.length > 0 && !selectedId) setSelectedId(convs[0].id);
  }

  async function loadMessages(convId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('criado_em', { ascending: true });
    setMessages((data ?? []) as Message[]);
  }

  async function handleReply() {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);

    const { data: { user } } = await supabase.auth.getUser();
    const senderId = user?.id ?? 'staff';

    const { data, error } = await supabase.from('messages').insert({
      conversation_id: selectedId,
      sender_id: senderId,
      sender_type: 'staff',
      body: reply.trim(),
      attachments: [],
    }).select().single();

    if (error) {
      console.error('Erro ao enviar resposta:', error);
      alert('Erro ao enviar: ' + error.message);
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev;
        return [...prev, data as Message];
      });
    }

    setReply('');
    setSending(false);
  }

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-220px)] rounded-xl border overflow-hidden">
      <div className="w-72 border-r overflow-y-auto bg-muted/30">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold">Portal do Cliente</h3>
          <p className="text-xs text-muted-foreground">{conversations.length} conversa(s)</p>
        </div>
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => setSelectedId(conv.id)}
            className={`w-full text-left px-3 py-3 border-b hover:bg-accent/50 transition ${
              selectedId === conv.id ? 'bg-accent' : ''
            }`}
          >
            <p className="text-sm font-medium truncate">{conv.client_nome}</p>
            <p className="text-xs text-muted-foreground truncate">{conv.client_email}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {new Date(conv.atualizado_em).toLocaleDateString('pt-BR')}
            </p>
          </button>
        ))}
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">
            Nenhuma conversa do portal ainda.
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        {selected ? (
          <>
            <div className="px-4 py-3 border-b bg-background">
              <p className="text-sm font-semibold">{selected.client_nome}</p>
              <p className="text-xs text-muted-foreground">{selected.subject || 'Conversa do Portal'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender_type === 'staff' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender_type === 'staff'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted rounded-bl-md'
                    }`}
                  >
                    {msg.body && <p>{msg.body}</p>}
                    {msg.attachments?.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <span key={i} className="inline-block text-xs opacity-80">
                            📎 {att.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] opacity-60 mt-1">
                      {new Date(msg.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Responder ao cliente..."
                  className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {sending ? '...' : 'Enviar'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}
