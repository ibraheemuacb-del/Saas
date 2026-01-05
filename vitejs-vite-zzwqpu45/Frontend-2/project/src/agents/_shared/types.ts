export type CanonicalTag =
  | "parsed"
  | "standardized"
  | "enriched"
  | "compliance_checked"
  | "scored"
  | "strong_pre"
  | "weak_pre"
  | "strong_post"
  | "weak_post"
  | "missing_name"
  | "missing_role"
  | "missing_location"
  | "invalid_experience"
  | "out_of_range_experience";

export type StageKey =
  | "parsed"
  | "standardized"
  | "enriched"
  | "compliance"
  | "scored";

export interface Candidate {
  id?: string;
  job_id?: string;
  name: string;
  role: string;
  location: string;
  experience_years: number;
  skills: string[];
  linkedin?: string | null;
  github?: string | null;

  compliant?: boolean;
  compliance_tags?: string[];
  tags?: CanonicalTag[];

  pre_score?: number;
  post_score?: number;
  final_score?: number;

  interview_score?: number;
  rating?: string;

  reference_status?: string;
  reference_source?: string;
  reference_locked?: boolean;

  offer_status?: string;
  offer_source?: string;
  offer_locked?: boolean;

  onboarding_status?: string;
  onboarding_source?: string;
  onboarding_locked?: boolean;

  last_status_changed_at?: string;
  created_at?: string;
}

export function addTags<T extends { tags?: CanonicalTag[] }>(
  obj: T,
  newTags: CanonicalTag[]
): T {
  const set = new Set([...(obj.tags || []), ...newTags]);
  return { ...obj, tags: Array.from(set) };
}

export function safeArray<T>(value: any): T[] {
  return Array.isArray(value) ? value : [];
}
