import{W as y,s}from"./index-CFBGuBjp.js";function M(_){return y({queryKey:["team-members",_],queryFn:async()=>{var p;let t=_;if(!t){const{data:e}=await s.auth.getUser(),r=(p=e==null?void 0:e.user)==null?void 0:p.id;if(r){const{data:m}=await s.from("profiles").select("organization_id").eq("id",r).maybeSingle();t=(m==null?void 0:m.organization_id)??void 0}}if(!t)return[];const i=await s.from("profiles").select("*").eq("organization_id",t).order("created_at",{ascending:!1});if(i.error)throw i.error;const g=i.data||[],o=g.map(e=>e.id);if(o.length===0)return[];const[d,a,n]=await Promise.all([s.from("user_roles").select("*").in("user_id",o),s.from("squad_members").select(`
            user_id,
            role,
            squad:squad_id (id, name, color, icon_url)
          `).in("user_id",o),s.from("user_product_assignments").select(`
            id,
            user_id,
            monthly_goal,
            product:product_id (id, name)
          `).in("user_id",o)]);if(d.error)throw d.error;if(a.error)throw a.error;if(n.error)throw n.error;const f=d.data||[],h=a.data||[],q=n.data||[],u=new Map;f.forEach(e=>{const r=u.get(e.user_id)||[];r.push(e),u.set(e.user_id,r)});const c=new Map;h.forEach(e=>{if(e.squad){const r=c.get(e.user_id)||[];r.push({id:e.squad.id,name:e.squad.name,color:e.squad.color,icon_url:e.squad.icon_url,role:e.role||"member"}),c.set(e.user_id,r)}});const l=new Map;return q.forEach(e=>{if(e.product&&e.product.id){const r=l.get(e.user_id)||[];r.push({id:e.product.id,name:e.product.name,monthly_goal:e.monthly_goal||0,assignment_id:e.id}),l.set(e.user_id,r)}}),g.map(e=>({...e,roles:u.get(e.id)||[],squads:c.get(e.id)||[],products:l.get(e.id)||[]}))},staleTime:3e4,gcTime:6e4})}export{M as u};
