import { supabase } from "../lib/supabase";

export type AuditEntry = {
  id?: string;
  candidate_id: string;
  action: string;
  metadata: any;
  created_at?: string;
};

/**
 * Logs an audit entry for a candidate.
 * Called by stage changes, offer flow, rejection flow, scoring, onboarding, automation, etc.
 */
export async function logAudit(
  candidateId: string,
  action: string,
  metadata: any = {}
) {
  const entry: AuditEntry = {
    candidate_id: candidateId,
    action,
    metadata,
  };

  const { error } = await supabase.from("audit_log").insert(entry);

  if (error) throw error;

  return entry;
}

/**
 * Fetch all audit entries for a candidate, sorted newest → oldest.
 */
export async function getAuditLog(candidateId: string) {
  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as AuditEntry[];
}
