const { runEvidenceAutomation } = await import("./src/server/evidence-score.server.ts");
const res = await runEvidenceAutomation();
console.log(JSON.stringify(res, null, 2));
