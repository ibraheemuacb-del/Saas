/*
  Recruitment SaaS Database Schema

  1. New Tables
    - jobs
      - id (uuid, primary key)
      - title (text) - Job title
      - department (text) - Department name
      - location (text) - Job location
      - salary_range (text) - Salary range
      - description (text) - Job description
      - status (text) - Draft or Published
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - candidates
      - id (uuid, primary key)
      - job_id (uuid, foreign key to jobs)
      - name (text) - Candidate name
      - email (text) - Candidate email
      - photo_url (text) - Profile photo URL
      - pre_interview_score (integer) - Score before interview (0-100)
      - post_interview_score (integer) - Score after interview (0-100)
      - reference_check_passed (boolean) - Whether reference check passed
      - experience (jsonb) - Array of experience bullets
      - interview_transcript (text) - Interview transcript
      - interview_status (text) - Not Started, Scheduled, Completed
      - created_at (timestamptz)
    
    - offers
      - id (uuid, primary key)
      - candidate_id (uuid, foreign key to candidates)
      - job_id (uuid, foreign key to jobs)
      - salary_offer (text) - Salary offer amount
      - start_date (date) - Proposed start date
      - status (text) - Draft, Sent, Accepted, Rejected
      - ai_recommendation (text) - AI-generated recommendation text
      - is_top_pick (boolean) - Whether this is AI's top pick
      - created_at (timestamptz)
      - sent_at (timestamptz)
    
    - onboarding
      - id (uuid, primary key)
      - candidate_id (uuid, foreign key to candidates)
      - documents_signed (boolean) - Whether documents are signed
      - account_created (boolean) - Whether account is created
      - orientation_scheduled (boolean) - Whether orientation is scheduled
      - orientation_date (date) - Date of orientation
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage all data
    
  3. Notes
    - This schema supports the full recruitment workflow
    - Experience is stored as JSONB for flexibility
    - Status fields use text for easy filtering
*/

CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  department text NOT NULL,
  location text NOT NULL,
  salary_range text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  photo_url text DEFAULT '',
  pre_interview_score integer DEFAULT 0,
  post_interview_score integer DEFAULT 0,
  reference_check_passed boolean DEFAULT false,
  experience jsonb DEFAULT '[]'::jsonb,
  interview_transcript text DEFAULT '',
  interview_status text DEFAULT 'Not Started',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  salary_offer text NOT NULL,
  start_date date,
  status text NOT NULL DEFAULT 'Draft',
  ai_recommendation text DEFAULT '',
  is_top_pick boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

CREATE TABLE IF NOT EXISTS onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  documents_signed boolean DEFAULT false,
  account_created boolean DEFAULT false,
  orientation_scheduled boolean DEFAULT false,
  orientation_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view jobs"
  ON jobs FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view candidates"
  ON candidates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert candidates"
  ON candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates"
  ON candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete candidates"
  ON candidates FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view offers"
  ON offers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert offers"
  ON offers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update offers"
  ON offers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete offers"
  ON offers FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view onboarding"
  ON onboarding FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert onboarding"
  ON onboarding FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update onboarding"
  ON onboarding FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete onboarding"
  ON onboarding FOR DELETE
  TO authenticated
  USING (true);