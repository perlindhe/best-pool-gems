import { creteTop15 } from "../../src/data/hotels";
import { offSeasonExtras, rankedHotelIsHeatedOutdoor } from "../../src/data/off-season";
const slugify=(s:string)=>s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const q=(v:any)=>v==null?"NULL":typeof v==="number"?String(v):typeof v==="boolean"?String(v):`'${String(v).replace(/'/g,"''")}'`;
const rows:any[]=[];
for(const h of creteTop15){
  const heated=rankedHotelIsHeatedOutdoor(h);
  rows.push({slug:slugify(h.name),name:h.name,neighborhood:h.neighborhood,pool_type:h.poolType,score:h.score,season:h.bestTime,heated,outdoor:!/indoor only/i.test(h.poolType),rank:h.rank,why:h.highlight,notes:h.description,tags:h.tags??[]});
}
for(const h of offSeasonExtras.crete){
  rows.push({slug:slugify(h.name),name:h.name,neighborhood:h.neighborhood,pool_type:h.poolType,score:h.score??null,season:h.heatedMonths,heated:true,outdoor:true,rank:null,why:h.note,notes:h.note,tags:[]});
}
const seen=new Set<string>();
const uniq=rows.filter(r=>!seen.has(r.slug)&&seen.add(r.slug));
const hotelVals=uniq.map(r=>`(${[q(r.slug),q(r.name),q("Crete"),q("crete"),q("Greece"),q(r.neighborhood),q(r.pool_type),q(r.heated),q(r.outdoor),q(true),q(r.season),q(/year-?round/i.test(r.season||"")),q(r.why),q(r.rank),`ARRAY[${r.tags.map(q).join(",")}]::text[]`].join(",")})`).join(",\n");
console.log(`INSERT INTO public.hotels (slug,name,city,city_slug,country,neighborhood,pool_type,heated_pool,outdoor,has_pool,season,year_round,why_included,rank_position,tags) VALUES\n${hotelVals}\nON CONFLICT (slug) DO NOTHING;\n`);
const scoreVals=uniq.filter(r=>r.score!=null).map(r=>`((SELECT id FROM public.hotels WHERE slug=${q(r.slug)}), ${r.score}, ${q(r.season)}, ${q(r.pool_type)}, ${q(r.notes)})`).join(",\n");
console.log(`INSERT INTO public.pool_scores (hotel_id, pool_score_0_10, best_time, pool_type, editorial_notes) VALUES\n${scoreVals}\nON CONFLICT (hotel_id) DO NOTHING;`);
console.log(`-- count ${uniq.length}`);
