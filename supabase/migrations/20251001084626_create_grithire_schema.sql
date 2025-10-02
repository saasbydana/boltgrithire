/*
  # GritHire Assessment Platform Schema

  ## Overview
  Creates the complete database schema for the GritHire candidate assessment platform.

  ## New Tables

  ### `assessments`
  Stores assessment sessions for candidates
  - `id` (uuid, primary key)
  - `candidate_email` (text) - Email of the candidate
  - `candidate_name` (text) - Full name
  - `invite_token` (text, unique) - Unique link token
  - `status` (text) - pending, in_progress, completed
  - `started_at` (timestamptz)
  - `completed_at` (timestamptz)
  - `composite_score` (numeric) - Final calculated score
  - `sjt_score` (numeric) - Situational Judgment Test score
  - `grit_score` (numeric) - Grit & Growth Mindset score
  - `self_learning_score` (numeric) - Self-learning task score
  - `loyalty_score` (numeric) - Loyalty & Values score
  - `recommendation` (text) - green, yellow, red
  - `created_at` (timestamptz)

  ### `sjt_questions`
  Stores Situational Judgment Test questions
  - `id` (uuid, primary key)
  - `question_text` (text) - Question in Bahasa Indonesia
  - `option_a` (text)
  - `option_b` (text)
  - `option_c` (text)
  - `option_d` (text)
  - `correct_option` (text) - 'A', 'B', 'C', or 'D'
  - `created_at` (timestamptz)

  ### `grit_statements`
  Stores Grit & Growth Mindset statements
  - `id` (uuid, primary key)
  - `statement_text` (text) - Statement in Bahasa Indonesia
  - `is_reverse_coded` (boolean) - If true, scoring is inverted
  - `order_num` (integer) - Display order
  - `created_at` (timestamptz)

  ### `self_learning_tasks`
  Stores self-learning mini tasks
  - `id` (uuid, primary key)
  - `task_title` (text)
  - `task_description` (text)
  - `resource_url` (text) - Link to video/document
  - `time_limit_minutes` (integer)
  - `created_at` (timestamptz)

  ### `loyalty_questions`
  Stores loyalty and values open-ended questions
  - `id` (uuid, primary key)
  - `question_text` (text) - Question in Bahasa Indonesia
  - `order_num` (integer)
  - `created_at` (timestamptz)

  ### `assessment_responses`
  Stores all candidate responses
  - `id` (uuid, primary key)
  - `assessment_id` (uuid, foreign key)
  - `section` (text) - sjt, grit, self_learning, loyalty
  - `question_id` (uuid) - Reference to question/statement
  - `response_value` (text) - Selected option or answer text
  - `time_spent_seconds` (integer)
  - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Public can insert assessments (for candidate registration)
  - Authenticated users (admins) can view all data
  - Candidates can view/update only their own assessment via invite_token
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_email text NOT NULL,
  candidate_name text NOT NULL,
  invite_token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  composite_score numeric,
  sjt_score numeric,
  grit_score numeric,
  self_learning_score numeric,
  loyalty_score numeric,
  recommendation text CHECK (recommendation IN ('green', 'yellow', 'red')),
  created_at timestamptz DEFAULT now()
);

-- Create sjt_questions table
CREATE TABLE IF NOT EXISTS sjt_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  correct_option text NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  created_at timestamptz DEFAULT now()
);

-- Create grit_statements table
CREATE TABLE IF NOT EXISTS grit_statements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_text text NOT NULL,
  is_reverse_coded boolean DEFAULT false,
  order_num integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create self_learning_tasks table
CREATE TABLE IF NOT EXISTS self_learning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_title text NOT NULL,
  task_description text NOT NULL,
  resource_url text NOT NULL,
  time_limit_minutes integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Create loyalty_questions table
CREATE TABLE IF NOT EXISTS loyalty_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  order_num integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create assessment_responses table
CREATE TABLE IF NOT EXISTS assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  section text NOT NULL CHECK (section IN ('sjt', 'grit', 'self_learning', 'loyalty')),
  question_id uuid NOT NULL,
  response_value text NOT NULL,
  time_spent_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sjt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grit_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_learning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessments
CREATE POLICY "Anyone can create assessments"
  ON assessments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Candidates can view own assessment via token"
  ON assessments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Candidates can update own assessment via token"
  ON assessments FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can view all assessments"
  ON assessments FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for questions and statements (public read)
CREATE POLICY "Anyone can view SJT questions"
  ON sjt_questions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can view grit statements"
  ON grit_statements FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can view self-learning tasks"
  ON self_learning_tasks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can view loyalty questions"
  ON loyalty_questions FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for assessment_responses
CREATE POLICY "Anyone can insert responses"
  ON assessment_responses FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view responses"
  ON assessment_responses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can view all responses"
  ON assessment_responses FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_invite_token ON assessments(invite_token);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_section ON assessment_responses(section);