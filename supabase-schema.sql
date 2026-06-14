-- Edojo SPA Database Schema
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS spa_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Student Info
  student_name TEXT NOT NULL,
  class TEXT NOT NULL,
  school_name TEXT,
  parent_name TEXT,
  parent_contact TEXT,
  student_email TEXT,
  assessment_date DATE DEFAULT CURRENT_DATE,

  -- Section 1: Academic Background
  q1_academic_performance TEXT,
  q2_difficult_subjects TEXT[],
  q3_academic_challenge TEXT,
  q4_attends_tuition BOOLEAN,

  -- Section 3: Concept Clarity (Q10-Q12)
  q10_concept_speed TEXT,
  q11_answer_understanding TEXT,
  q12_explain_confidence TEXT,

  -- Section 4: Retention (Q13-Q15)
  q13_chapter_memory TEXT,
  q14_forget_before_exam TEXT,
  q15_revision_frequency TEXT,

  -- Section 5: Focus (Q16-Q18)
  q16_focus_duration TEXT,
  q17_main_distraction TEXT,
  q18_mind_wandering TEXT,

  -- Section 6: Consistency (Q19-Q21)
  q19_study_schedule TEXT,
  q20_missed_sessions TEXT,
  q21_homework_completion TEXT,

  -- Section 7: Exam Readiness (Q22-Q24)
  q22_exam_confidence TEXT,
  q23_difficult_question TEXT,
  q24_practice_tests TEXT,

  -- Section 8: Self-Testing (Q25-Q27)
  q25_mistake_review TEXT,
  q26_error_notebook TEXT,
  q27_self_testing TEXT,

  -- Section 9: Goals
  q28_primary_goal TEXT,
  q29_improvement_wish TEXT,
  q30_additional_info TEXT,

  -- Calculated Scores
  concept_clarity_score NUMERIC(5,2),
  retention_score NUMERIC(5,2),
  focus_score NUMERIC(5,2),
  consistency_score NUMERIC(5,2),
  exam_readiness_score NUMERIC(5,2),
  self_testing_score NUMERIC(5,2),
  academic_health_score NUMERIC(5,2),
  score_level TEXT,

  -- Report
  pdf_url TEXT,
  email_sent BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE spa_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can insert (form submissions)
CREATE POLICY "Allow public insert" ON spa_submissions
  FOR INSERT WITH CHECK (true);

-- Policy: only service role can read all
CREATE POLICY "Allow service role read" ON spa_submissions
  FOR SELECT USING (auth.role() = 'service_role');
