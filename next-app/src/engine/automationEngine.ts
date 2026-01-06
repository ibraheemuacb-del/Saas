import type { Stage } from "../lib/stages";

export async function triggerAutomationOnStageChange(
  candidateId: string,
  from: Stage,
  to: Stage
) {
  console.log("Automation on stage change:", { candidateId, from, to });
}
