-- ============================================================
-- FerriBor Global 4.0 — Policies para staff do CRM acessar conversas
-- Permite que usuários com service_role (edge functions / CRM)
-- leiam e escrevam em todas as conversas e mensagens.
-- ============================================================

-- Staff pode ler todas as conversas
create policy "conversations_staff_select" on public.conversations
  for select using (auth.jwt() ->> 'role' = 'service_role');

-- Staff pode atualizar status das conversas
create policy "conversations_staff_update" on public.conversations
  for update using (auth.jwt() ->> 'role' = 'service_role');

-- Staff pode ler todas as mensagens
create policy "messages_staff_select" on public.messages
  for select using (auth.jwt() ->> 'role' = 'service_role');

-- Staff pode enviar mensagens como 'staff'
create policy "messages_staff_insert" on public.messages
  for insert with check (
    sender_type = 'staff' and auth.jwt() ->> 'role' = 'service_role'
  );
