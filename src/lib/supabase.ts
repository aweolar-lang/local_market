import { createClient } from '@supabase/supabase-js';

// We pull the keys from the .env.local file we just created
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This creates a single instance of the database client we can use in any file
export const supabase = createClient(supabaseUrl, supabaseKey);