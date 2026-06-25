import{u as o,W as c,s as d}from"./index-CFBGuBjp.js";function p(){const{user:n}=o();return c({queryKey:["squads"],queryFn:async()=>{const{data:e,error:r}=await d.from("sales_squads").select(`
          *,
          product:products(id, name)
        `).eq("is_active",!0).order("created_at",{ascending:!1});if(r)throw r;const u=(e==null?void 0:e.map(a=>a.id))||[];if(u.length>0){const{data:a}=await d.from("squad_members").select("squad_id").in("squad_id",u),t=new Map;return a==null||a.forEach(s=>{t.set(s.squad_id,(t.get(s.squad_id)||0)+1)}),e==null?void 0:e.map(s=>({...s,members_count:t.get(s.id)||0}))}return e},enabled:!!n})}export{p as u};
