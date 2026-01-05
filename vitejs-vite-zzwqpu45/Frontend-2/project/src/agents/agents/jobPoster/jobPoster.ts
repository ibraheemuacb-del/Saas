export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary_range: string;
  description: string;
  skills?: string[];
  status: "Draft" | "Published"; // matches Supabase statuses
}

export interface PostResult {
  success: boolean;
  jobId: string;
  boards: string[];
  tags: string[];
}

export async function postToJobBoards(job: Job): Promise<PostResult> {
  // Integrate external APIs here; MVP emits success + canonical tags
  return {
    success: true,
    jobId: job.id,
    boards: ["LinkedIn", "Indeed", "Glassdoor"],
    tags: ["posted", job.status.toLowerCase()],
  };
}
