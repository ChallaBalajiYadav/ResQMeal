const SUPABASE_URL = "https://yaywcarudxpsnbkktbiw.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheXdjYXJ1ZHhwc25ia2t0Yml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwMjE0MjgsImV4cCI6MjEwNjU5NzQyOH0.rtaLC56fYkLhDPMF5LHqY2N_ZEvKFv1EnlkmR94npwE";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);