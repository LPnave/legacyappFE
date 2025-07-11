import { createClient } from '@supabase/supabase-js';

// Update these values with your actual Supabase project details
export const SUPABASE_URL = 'https://qfnlzgqwqclmzuavqjub.supabase.co';
// export const SUPABASE_URL = 'https://qfnlzgqwqclmzuavqjub.supabase.co/storage/v1/s3';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbmx6Z3F3cWNsbXp1YXZxanViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjU0MjUsImV4cCI6MjA2Nzc0MTQyNX0.w_PE4qsdbeZBofSUlBLodpALRWGgOsTB2tAl7wt3EM8';
export const SUPABASE_BUCKET = 'legacyappdata'; //this is also the password for the bucket

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 