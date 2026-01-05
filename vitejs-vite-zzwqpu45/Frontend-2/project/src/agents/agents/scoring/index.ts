import { Candidate, addTags } from "../../_shared/types";

const weights = { pre: 0.4, post: 0.6 };

// Tunable skill weights
const skillWeights: Record<string, number> = {
  javascript: 8,
  typescript: 10,
  react: 10,
  node: 8,
  express: 6,
  postgres: 6,
  python: 8,
  sql: 6,
  pandas: 5,
};

function preScreenScore(c: Candidate): number {
  let score = 0;
  if (c.name) score += 20;
  if (c.role) score += 20;
  if (c.location) score += 10;

  const skillSignal = c.skills.reduce((acc, s) => acc + (skillWeights[s] || 0), 0);
  score += Math.min(25, skillSignal);

  return Math.min(75, score);
}

function postScreenScore(c: Candidate): number {
  let score = 0;
  if (c.linkedin) score += 20;
  if (c.github) score += 15;
  if (c.compliant) score += 20;

  const exp = Math.min(20, Math.max(0, c.experience_years));
  score += exp;

  const skillSignal = c.skills.reduce((acc, s) => acc + (skillWeights[s] || 0), 0);
  score += Math.min(40, skillSignal);

  return Math.min(120, score);
}

export async function scoreCandidate(c: Candidate, jobId: string): Promise<Candidate> {
  const pre = preScreenScore(c);
  const post = postScreenScore(c);
  const final = pre * weights.pre + post * weights.post;

  const preTag = pre >= 35 ? "strong_pre" : "weak_pre";
  const postTag = post >= 65 ? "strong_post" : "weak_post";

  const withScores: Candidate = {
    ...c,
    job_id: jobId,
    pre_score: Math.round(pre),
    post_score: Math.round(post),
    final_score: Math.round(final),
  };

  return addTags(withScores, ["scored", preTag, postTag]);
}
