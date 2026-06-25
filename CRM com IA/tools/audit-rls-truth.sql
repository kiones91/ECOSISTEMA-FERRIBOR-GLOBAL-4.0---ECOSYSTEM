-- Verdade definitiva sobre RLS por tabela no schema public.
-- Resumo agregado + lista de tabelas com RLS ON mas SEM policy (deny-all p/ anon/auth).
with t as (
  select
    c.oid,
    c.relname,
    c.relrowsecurity as rls_on,
    (select count(*) from pg_policy p where p.polrelid = c.oid) as n_policies
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
)
select 'RESUMO' as tipo, null as tabela, null as n_policies,
  count(*) filter (where rls_on) as rls_on_total,
  count(*) filter (where not rls_on) as rls_off_total,
  count(*) filter (where rls_on and n_policies = 0) as rls_on_sem_policy,
  count(*) as total
from t
union all
select 'RLS_ON_SEM_POLICY' as tipo, relname as tabela, n_policies, null, null, null, null
from t
where rls_on and n_policies = 0
order by tipo, tabela;
