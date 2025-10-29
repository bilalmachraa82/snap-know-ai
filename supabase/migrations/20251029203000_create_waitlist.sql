-- Create waitlist table for email capture
-- This table stores email addresses from users who sign up for early access
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing_page',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add email validation constraint
ALTER TABLE public.waitlist
  ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Enable RLS on waitlist
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Waitlist policies
-- Anyone can insert (no auth required)
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Only service role can read (admins via Supabase dashboard)
-- Note: Regular authenticated users cannot read the waitlist
CREATE POLICY "Service role can read waitlist"
  ON public.waitlist FOR SELECT
  USING (false); -- No one can read via RLS, only service role bypasses RLS

-- Create index for better query performance and duplicate detection
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE public.waitlist IS 'Stores email addresses from users who join the waitlist for early access';
COMMENT ON COLUMN public.waitlist.source IS 'Tracks where the user signed up from (e.g., landing_page, blog, etc.)';
