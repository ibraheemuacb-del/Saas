import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials (frontend only)
const supabaseUrl = 'https://awqqvtrouljkwxjqmgzh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3cXF2dHJvdWxqa3d4anFtZ3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3OTU1NDIsImV4cCI6MjA4MTM3MTU0Mn0.E4ybEBxYcYgsLmYHBhWIbXUcZzq-C-3yjLJwK9Om-ts';

// Export client for frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
