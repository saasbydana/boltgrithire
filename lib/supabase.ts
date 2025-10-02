import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Assessment = {
  id: string;
  candidate_email: string;
  candidate_name: string;
  invite_token: string;
  status: 'pending' | 'in_progress' | 'completed';
  started_at: string | null;
  completed_at: string | null;
  composite_score: number | null;
  sjt_score: number | null;
  grit_score: number | null;
  self_learning_score: number | null;
  loyalty_score: number | null;
  recommendation: 'green' | 'yellow' | 'red' | null;
  created_at: string;
};

export type SJTQuestion = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  created_at: string;
};

export type GritStatement = {
  id: string;
  statement_text: string;
  is_reverse_coded: boolean;
  order_num: number;
  created_at: string;
};

export type SelfLearningTask = {
  id: string;
  task_title: string;
  task_description: string;
  resource_url: string;
  time_limit_minutes: number;
  created_at: string;
};

export type LoyaltyQuestion = {
  id: string;
  question_text: string;
  order_num: number;
  created_at: string;
};

export type AssessmentResponse = {
  id: string;
  assessment_id: string;
  section: 'sjt' | 'grit' | 'self_learning' | 'loyalty';
  question_id: string;
  response_value: string;
  time_spent_seconds: number;
  created_at: string;
};
