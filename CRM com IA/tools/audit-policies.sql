-- Policies das 35 tabelas que TEM policy (superficie de ataque real)
-- Mostra: tabela, nome da policy, comando, roles, e a expressao USING/WITH CHECK
select
  pol.schemaname || '.' || pol.tablename as tabela,
  pol.policyname as policy,
  pol.cmd as comando,
  array_to_string(pol.roles, ', ') as roles,
  coalesce(pol.qual, '(sem USING)') as using_expr,
  coalesce(pol.with_check, '(sem WITH CHECK)') as check_expr
from pg_policies pol
where pol.schemaname = 'public'
order by pol.tablename, pol.policyname;
