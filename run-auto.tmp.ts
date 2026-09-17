import { runEvidenceAutomation } from "./src/server/evidence-score.server";
const r = await runEvidenceAutomation();
console.log(JSON.stringify(r, null, 2));
