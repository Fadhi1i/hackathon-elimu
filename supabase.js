import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://tuatxlavzuoyjlcytuzc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YXR4bGF2enVveWpsY3l0dXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MTgzMTcsImV4cCI6MjA3MjE5NDMxN30.K5nyh3IJ78gWU1u6C6QuiRl3GlRDoGgVCHzrvOaSJ2U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
