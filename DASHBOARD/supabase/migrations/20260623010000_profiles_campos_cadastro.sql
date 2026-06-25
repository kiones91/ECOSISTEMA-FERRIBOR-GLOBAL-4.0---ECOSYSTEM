-- ============================================================
-- FerriBor Global 4.0 — campos de cadastro do cliente (profiles)
-- Amplia profiles com dados coletados no signup do Portal:
-- whatsapp, empresa, cargo. Atualiza o trigger de criação.
-- Integração base: Site → Dashboard (cadastro de clientes).
-- ============================================================

alter table public.profiles add column if not exists whatsapp text;
alter table public.profiles add column if not exists empresa text;
alter table public.profiles add column if not exists cargo text;

-- Recria a função para popular todos os campos vindos do signup metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, whatsapp, empresa, cargo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'whatsapp', ''),
    coalesce(new.raw_user_meta_data ->> 'empresa', ''),
    coalesce(new.raw_user_meta_data ->> 'cargo', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
