import { supabase } from "./supabase";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: "client" | "staff";
  body: string | null;
  attachments: { name: string; type: string; url?: string }[];
  criado_em: string;
};

export type Conversation = {
  id: string;
  client_id: string;
  status: "open" | "closed";
  subject: string | null;
  criado_em: string;
  atualizado_em: string;
};

export async function getOrCreateConversation(clientId: string): Promise<Conversation> {
  const { data: existing, error: selectErr } = await supabase
    .from("conversations")
    .select("*")
    .eq("client_id", clientId)
    .eq("status", "open")
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing as Conversation;
  if (selectErr) console.error("getOrCreateConversation select:", selectErr);

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ client_id: clientId, subject: "Suporte FerriBor" })
    .select()
    .single();

  if (error) {
    console.error("getOrCreateConversation insert:", error);
    throw error;
  }
  return created as Conversation;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("criado_em", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
  attachments: { name: string; type: string; url?: string }[] = []
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      sender_type: "client",
      body,
      attachments,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export function subscribeToMessages(
  conversationId: string,
  onMessage: (msg: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onMessage(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
