const { ingestPoolComments } = await import("./src/server/evidence-score.server.ts");
const { supabaseAdmin } = await import("./src/integrations/supabase/client.server.ts");
const { data } = await supabaseAdmin.from("hotels").select("id,slug,name,city").eq("slug","los-angeles-1-hotel-west-hollywood").maybeSingle();
console.log(data.name, data.city);
try { console.log(await ingestPoolComments(data.id)); } catch (e) { console.log("ERR", e.message); }
