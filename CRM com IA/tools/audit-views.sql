-- Views com SECURITY DEFINER (furam RLS: rodam com permissao do dono, nao do chamador)
select
  c.relname as view,
  case when c.reloptions::text like '%security_invoker=on%' or c.reloptions::text like '%security_invoker=true%'
       then 'invoker (ok)'
       else 'DEFINER (risco)' end as modo,
  pg_get_userbyid(c.relowner) as dono
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'v'
order by modo desc, c.relname;
