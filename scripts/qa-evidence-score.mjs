#!/usr/bin/env bun
/**
 * Automated tests for the Evidence-based Pool Score (evidence-v1).
 * Run: bun scripts/qa-evidence-score.mjs
 */
import {
  summarizeComments,
  scoreGuestSentiment,
  scoreHeating,
  countPools,
  scorePoolCount,
  scorePoolSize,
  scoreExternalRecognition,
  calculateConfidence,
  calculateTotal,
  evidenceQaErrors,
  canRank,
  robotsDirective,
  MIN_RELEVANT_COMMENTS,
} from "/dev-server/src/lib/evidence-score.ts";

let pass = 0;
let fail = 0;
function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
    console.log(`  ok   ${name}`);
  } else {
    fail++;
    console.log(`  FAIL ${name}\n       expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

const today = new Date();
const recent = (n) => new Date(today.getTime() - n * 86400000).toISOString().slice(0, 10);

function makeComments(positive, neutral, negative) {
  const out = [];
  let i = 0;
  const push = (sentiment, count) => {
    for (let k = 0; k < count; k++) {
      i++;
      out.push({
        text: `${sentiment} pool comment number ${i}`,
        sentiment,
        author: `guest-${i}`,
        stayGroupKey: `stay-${i}`,
        publishedAt: recent(30),
        sourceUrl: `https://reviews.example/r/${i}`,
      });
    }
  };
  push("positive", positive);
  push("neutral", neutral);
  push("negative", negative);
  return out;
}

console.log("\n== Test scenario from the specification ==");
{
  const comments = makeComments(32, 5, 3);
  const breakdown = summarizeComments(comments, today);
  check("relevant comments", breakdown.relevant, 40);

  const guestSentimentPoints = scoreGuestSentiment(breakdown);
  check("guest sentiment = 31.6", guestSentimentPoints, 31.6);

  const heatingPoints = scoreHeating("shared_full_season");
  check("heating = 13", heatingPoints, 13);

  const pools = [
    { name: "Main Pool", category: "shared_swimming_pool", areaSqm: 220, sizeVerified: true },
    { name: "Terrace Pool", category: "shared_swimming_pool", areaSqm: 90, sizeVerified: true },
    { name: "Kids Pool", category: "children_pool" },
  ];
  const counts = countPools(pools);
  check("shared pools counted", counts.sharedSwimmingPoolCount, 2);
  const poolCountPoints = scorePoolCount(counts);
  check("pool count = 11", poolCountPoints, 11);

  const poolSizePoints = scorePoolSize(pools);
  check("pool size = 16", poolSizePoints, 16);

  const externalRecognitionPoints = scoreExternalRecognition([
    { url: "https://cntraveler.com/a", tier: "A", isAboutPool: true, isPositive: true },
    { url: "https://ft.com/b", tier: "A", isAboutPool: true, isPositive: true },
  ]);
  check("external recognition = 10", externalRecognitionPoints, 10);

  const total = calculateTotal({
    guestSentimentPoints,
    heatingPoints,
    poolCountPoints,
    poolSizePoints,
    externalRecognitionPoints,
  });
  check("total = 81.6", total.totalPoints, 81.6);
  check("displayed = 8.2", total.scoreOutOfTen, 8.2);
  check("displayed 0-100 = 82", Math.round(total.totalPoints), 82);

  const confidence = calculateConfidence({
    hasOfficialSource: true,
    independentSourceCount: 2,
    relevantComments: breakdown.relevant,
    recentShare: breakdown.recentShare,
    heatingConfirmed: true,
    poolCountConfirmed: true,
    sizeConfirmed: true,
    hasConflicts: false,
    allFactorsNumeric: true,
  });
  check("confidence = high", confidence, "high");

  const qa = evidenceQaErrors({
    guestSentimentPoints,
    heatingPoints,
    poolCountPoints,
    poolSizePoints,
    externalRecognitionPoints,
    breakdown,
    counts,
    heatingCategory: "shared_full_season",
    totalPoints: total.totalPoints,
    scoreOutOfTen: total.scoreOutOfTen,
    hasOfficialSource: true,
    approvedBy: "Per Lindhe",
  });
  check("no blocking QA errors", qa, []);
  check(
    "ranks",
    canRank({
      verificationStatus: "fully_verified",
      confidenceLevel: confidence,
      totalPoints: total.totalPoints,
      approvedBy: "Per Lindhe",
      approvedAt: new Date().toISOString(),
      blockingQaErrors: qa,
    }),
    true,
  );
}

console.log("\n== Missing data never becomes zero ==");
{
  const few = summarizeComments(makeComments(2, 0, 0), today);
  check("under three comments -> null", scoreGuestSentiment(few), null);
  check("minimum is three", MIN_RELEVANT_COMMENTS, 3);
  const three = summarizeComments(makeComments(3, 0, 0), today);
  check("exactly three comments -> scored", scoreGuestSentiment(three) !== null, true);
  check("heating unknown -> null", scoreHeating("not_confirmed"), null);
  check("heating conflicting -> null", scoreHeating("conflicting"), null);
  check("no heated pool -> 0 points", scoreHeating("none_heated"), 0);

  const t = calculateTotal({
    guestSentimentPoints: null,
    heatingPoints: 13,
    poolCountPoints: 11,
    poolSizePoints: 16,
    externalRecognitionPoints: 10,
  });
  check("missing factor -> no total", t.totalPoints, null);
  check("missing factor -> no 0-10 score", t.scoreOutOfTen, null);
  check("reason shown", t.blockingReasons, ["Insufficient guest feedback"]);
}

console.log("\n== Pool counting rules ==");
{
  const privateHeavy = countPools([
    { name: "Garden Pool", category: "shared_swimming_pool" },
    ...Array.from({ length: 40 }, (_, i) => ({ name: `Suite ${i}`, category: "private_room_pool" })),
  ]);
  check("private pools are one category", privateHeavy.privatePoolCategoryCount, 1);
  check("private pools do not inflate shared count", privateHeavy.sharedSwimmingPoolCount, 1);
  check("one shared pool + private = 7", scorePoolCount(privateHeavy), 7);

  const jac = countPools([
    { name: "Rooftop Pool", category: "shared_swimming_pool" },
    { name: "Hot Tub", category: "jacuzzi_hot_tub" },
  ]);
  check("jacuzzi is not a swimming pool", jac.sharedSwimmingPoolCount, 1);
  check("jacuzzi counted separately", jac.jacuzziCount, 1);

  const dup = countPools([
    { name: "Main Pool", category: "shared_swimming_pool" },
    { name: "main pool", category: "shared_swimming_pool" },
  ]);
  check("duplicate pool names merged", dup.sharedSwimmingPoolCount, 1);

  check("no shared pool -> null", scorePoolCount(countPools([{ name: "Spa", category: "spa_pool" }])), null);
  check("cap at 15", scorePoolCount({
    sharedSwimmingPoolCount: 4,
    spaPoolCount: 1,
    childrenPoolCount: 1,
    privatePoolCategoryCount: 1,
    plungePoolCount: 0,
    jacuzziCount: 0,
  }), 15);
}

console.log("\n== Pool size rules ==");
{
  check("area wins over length", scorePoolSize([
    { category: "shared_swimming_pool", areaSqm: 420, lengthMetres: 12, sizeVerified: true },
  ]), 20);
  check("length used when area missing", scorePoolSize([
    { category: "shared_swimming_pool", lengthMetres: 22, sizeVerified: true },
  ]), 16);
  check("unverified size -> null", scorePoolSize([
    { category: "shared_swimming_pool", sizeVerified: true },
  ]), null);
  check("private pool is not the size measure", scorePoolSize([
    { category: "private_room_pool", areaSqm: 500, sizeVerified: true },
  ]), null);
}

console.log("\n== External recognition rules ==");
{
  check("same article counted once", scoreExternalRecognition([
    { url: "https://cntraveler.com/story", tier: "A", isAboutPool: true, isPositive: true },
    { url: "https://www.cntraveler.com/story/", tier: "A", isAboutPool: true, isPositive: true },
  ]), 5);
  check("not about the pool -> no points", scoreExternalRecognition([
    { url: "https://ft.com/x", tier: "A", isAboutPool: false, isPositive: true },
  ]), 0);
  check("excluded source -> no points", scoreExternalRecognition([
    { url: "https://hotel.com/pool", tier: "A", isAboutPool: true, isPositive: true, excludedReason: "hotel's own site" },
  ]), 0);
  check("tier mix B+C", scoreExternalRecognition([
    { url: "https://regional.example/a", tier: "B", isAboutPool: true, isPositive: true },
    { url: "https://blog.example/b", tier: "C", isAboutPool: true, isPositive: true },
  ]), 3);
  check("capped at 10", scoreExternalRecognition([
    { url: "https://a.example", tier: "A", isAboutPool: true, isPositive: true },
    { url: "https://b.example", tier: "A", isAboutPool: true, isPositive: true },
    { url: "https://c.example", tier: "A", isAboutPool: true, isPositive: true },
  ]), 10);
  check("zero does not block the score", calculateTotal({
    guestSentimentPoints: 31.6,
    heatingPoints: 13,
    poolCountPoints: 11,
    poolSizePoints: 16,
    externalRecognitionPoints: 0,
  }).totalPoints, 71.6);
}

console.log("\n== Comment hygiene ==");
{
  const dupes = [
    { text: "The rooftop pool was amazing", sentiment: "positive", author: "A", sourceUrl: "https://x/1", publishedAt: recent(10) },
    { text: "The rooftop pool was amazing!", sentiment: "positive", author: "A", sourceUrl: "https://y/2", publishedAt: recent(10) },
    ...makeComments(6, 0, 0),
  ];
  const b = summarizeComments(dupes, today);
  check("duplicate removed once", b.duplicatesRemoved, 1);
  check("relevant after dedupe", b.relevant, 7);

  const owner = summarizeComments(
    [{ text: "Our stunning infinity pool awaits", sentiment: "positive", isOwnerContent: true }, ...makeComments(5, 0, 0)],
    today,
  );
  check("hotel copy not counted", owner.ownerContentRemoved, 1);
  check("owner copy excluded from relevant", owner.relevant, 5);

  const stay = summarizeComments(
    Array.from({ length: 6 }, (_, i) => ({
      text: `pool note ${i}`,
      sentiment: "positive",
      author: "Same Guest",
      stayGroupKey: "stay-1",
      publishedAt: recent(20),
    })),
    today,
  );
  check("max three per stay", stay.relevant, 3);
  check("extra capped", stay.stayCapped, 3);

  const unclear = summarizeComments(
    [
      ...makeComments(5, 0, 0),
      { text: "nice hotel overall", sentiment: "irrelevant", author: "Z", publishedAt: recent(5) },
      { text: "hmm", sentiment: "unclear", author: "Y", publishedAt: recent(5) },
    ],
    today,
  );
  check("unclear and irrelevant not counted", unclear.relevant, 5);
}

console.log("\n== Confidence and gating ==");
{
  check("old comments lower confidence", calculateConfidence({
    hasOfficialSource: true,
    independentSourceCount: 2,
    relevantComments: 25,
    recentShare: 0.3,
    heatingConfirmed: true,
    poolCountConfirmed: true,
    sizeConfirmed: true,
    hasConflicts: false,
    allFactorsNumeric: true,
  }), "medium");
  check("few comments -> low", calculateConfidence({
    hasOfficialSource: true,
    independentSourceCount: 1,
    relevantComments: 3,
    recentShare: 1,
    heatingConfirmed: false,
    poolCountConfirmed: true,
    sizeConfirmed: false,
    hasConflicts: false,
    allFactorsNumeric: false,
  }), "low");

  const lowGate = {
    verificationStatus: "fully_verified",
    confidenceLevel: "low",
    totalPoints: 81.6,
    approvedBy: "Editor",
    approvedAt: "2026-09-17T00:00:00Z",
    blockingQaErrors: [],
  };
  check("low confidence does not rank", canRank(lowGate), false);
  check("low confidence is noindex", robotsDirective(lowGate), "noindex, follow");
  check("partially verified does not rank", canRank({ ...lowGate, confidenceLevel: "high", verificationStatus: "partially_verified" }), false);
  check("unapproved does not rank", canRank({ ...lowGate, confidenceLevel: "high", approvedBy: null }), false);
  check("fully verified + approved indexes", robotsDirective({ ...lowGate, confidenceLevel: "high" }), "index, follow");
}

console.log("\n== QA blockers ==");
{
  const errs = evidenceQaErrors({
    guestSentimentPoints: 31.6,
    heatingPoints: 13,
    poolCountPoints: 11,
    poolSizePoints: null,
    externalRecognitionPoints: 10,
    breakdown: { relevant: 40 },
    counts: { sharedSwimmingPoolCount: 2, spaPoolCount: 0, childrenPoolCount: 0, privatePoolCategoryCount: 0, plungePoolCount: 0, jacuzziCount: 0 },
    heatingCategory: "shared_full_season",
    totalPoints: null,
    scoreOutOfTen: null,
    hasOfficialSource: true,
    approvedBy: "Editor",
  });
  check("missing size blocks", errs.includes("Pool size has no verified value"), true);
  check("photo estimate blocks", evidenceQaErrors({
    guestSentimentPoints: 31.6, heatingPoints: 13, poolCountPoints: 11, poolSizePoints: 16, externalRecognitionPoints: 10,
    breakdown: { relevant: 40 },
    counts: { sharedSwimmingPoolCount: 2, spaPoolCount: 0, childrenPoolCount: 0, privatePoolCategoryCount: 0, plungePoolCount: 0, jacuzziCount: 0 },
    heatingCategory: "shared_full_season", totalPoints: 81.6, scoreOutOfTen: 8.2,
    hasOfficialSource: true, approvedBy: "Editor", sizeEstimatedFromPhoto: true,
  }).includes("Pool size was estimated from a photograph"), true);
  check("mismatched 0-10 blocks", evidenceQaErrors({
    guestSentimentPoints: 31.6, heatingPoints: 13, poolCountPoints: 11, poolSizePoints: 16, externalRecognitionPoints: 10,
    breakdown: { relevant: 40 },
    counts: { sharedSwimmingPoolCount: 2, spaPoolCount: 0, childrenPoolCount: 0, privatePoolCategoryCount: 0, plungePoolCount: 0, jacuzziCount: 0 },
    heatingCategory: "shared_full_season", totalPoints: 81.6, scoreOutOfTen: 9.9,
    hasOfficialSource: true, approvedBy: "Editor",
  }).includes("The 0–10 score does not match the total points"), true);
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail === 0 ? 0 : 1);
