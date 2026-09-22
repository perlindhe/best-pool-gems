const { runEvidenceAutomation } = await import("./src/server/evidence-score.server.ts");
const offset = Number(process.argv[2] ?? 0);
const limit = Number(process.argv[3] ?? 5);
const r = await runEvidenceAutomation({ offset, limit });
console.log(JSON.stringify({ total: r.total, offset: r.offset, next: r.next_offset,
  results: r.results.map(x => ({ slug: x.slug, approved: x.approved, score: x.scoreOutOfTen, blockers: x.blockers.slice(0,3), error: x.error })) }, null, 1));
