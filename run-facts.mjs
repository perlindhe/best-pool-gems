const { ingestPoolFacts } = await import("./src/server/pool-facts.server.ts");
const { supabaseAdmin } = await import("./src/integrations/supabase/client.server.ts");
const { data } = await supabaseAdmin.from("hotels").select("id,slug,official_url,website_url").eq("slug","sydney-park-hyatt-sydney").maybeSingle();
console.log(data);
console.log("FIRECRAWL:", !!process.env.FIRECRAWL_API_KEY, "AI:", !!process.env.LOVABLE_API_KEY);
console.log(await ingestPoolFacts(data.id));
