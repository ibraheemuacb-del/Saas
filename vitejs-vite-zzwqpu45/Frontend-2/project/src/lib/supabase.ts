import { createClient } from '@supabase/supabase-js';

// Pull values from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Initialize the client
export const supabase = createClient(supabaseUrl, supabaseKey);
