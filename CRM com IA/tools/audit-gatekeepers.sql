-- As funcoes-porteiro de que toda a seguranca RLS depende.
-- Precisam ser SECURITY DEFINER com search_path fixo para nao serem sequestraveis.
select
  p.proname as funcao,
  case when p.prosecdef then 'DEFINER' else 'INVOKER' end as modo,
  coalesce(array_to_string(p.proconfig, ', '), '(SEM search_path - RISCO)') as config,
  pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_staff', 'can_manage_crm', 'has_role')
order by p.proname;
