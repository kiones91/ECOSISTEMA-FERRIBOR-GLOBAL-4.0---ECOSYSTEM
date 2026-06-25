-- Tabelas com RLS desligado QUE TAMBEM tem grant para anon/authenticated
-- (= realmente expostas pela Data API publica)
select
  c.relname as tabela,
  string_agg(distinct g.grantee, ', ' order by g.grantee) as roles_com_acesso,
  string_agg(distinct g.privilege_type, ', ' order by g.privilege_type) as privilegios
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
join information_schema.role_table_grants g
  on g.table_schema = n.nspname and g.table_name = c.relname
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
  and g.grantee in ('anon', 'authenticated')
group by c.relname
order by c.relname;
