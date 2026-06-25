-- Diagnostico: confirma que as queries de auditoria nao estao silenciosamente vazias
select
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='v') as total_views_public,
  (select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prosecdef=true) as total_funcs_definer,
  (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
     where n.nspname='public' and c.relkind='r' and c.relrowsecurity=false) as total_tabelas_rls_off,
  (select count(distinct g.table_name)
     from information_schema.role_table_grants g
     where g.table_schema='public' and g.grantee in ('anon','authenticated')) as tabelas_com_grant_anon_auth;
