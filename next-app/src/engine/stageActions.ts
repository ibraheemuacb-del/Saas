import { getCandidate } from "./candidateEngine";
import { updateStage } from "./stageEngine";
import type { Stage } from "../lib/stages";

export async function changeStage(candidateId: string, newStage: Stage) {
  const candidate = await getCandidate(candidateId);
  return updateStage(candidate, newStage);
}

export async function advanceStage(candidateId: string) {
  const candidate = await getCandidate(candidateId);
  const allowed = ALLOWED_TRANSITIONS[candidate.stage];
  if (!allowed || allowed.length === 0) {
    throw new Error(`No next stage available for ${candidate.stage}`);
  }
  return updateStage(candidate, allowed[0]);
}
