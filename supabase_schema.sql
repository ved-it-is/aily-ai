-- ==========================================================
-- Aily Supabase Setup Script
-- Paste and Run this in your Supabase Project -> SQL Editor
-- ==========================================================

-- 1. Create the user progress tracking table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, activity_id)
);

-- 2. Create index for lightning-fast progress lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_activity ON public.user_progress(activity_id);

-- 3. Enable Row Level Security (RLS) to keep user learning data strictly private
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Each student can only read and insert their own progress
DROP POLICY IF EXISTS "Users can view own progress" ON public.user_progress;
CREATE POLICY "Users can view own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.user_progress;
CREATE POLICY "Users can insert own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON public.user_progress;
CREATE POLICY "Users can delete own progress"
  ON public.user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify setup
COMMENT ON TABLE public.user_progress IS 'Stores completed chapters, challenges, and arcade questions for Aily students';
