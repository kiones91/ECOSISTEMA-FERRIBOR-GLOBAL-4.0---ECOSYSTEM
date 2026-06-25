-- Funcoes SECURITY DEFINER sem search_path fixo (vetor de SQL injection / hijack de schema)
select
  p.proname as funcao,
  case when p.prosecdef then 'DEFINER' else 'invoker' end as modo,
  coalesce(array_to_string(p.proconfig, ', '), '(sem config)') as config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.prosecdef = true
  and (p.proconfig is null or not exists (
    select 1 from unnest(p.proconfig) c where c like 'search_path=%'
  ))
order by p.proname;
