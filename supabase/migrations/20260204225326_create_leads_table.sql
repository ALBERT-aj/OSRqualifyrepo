/*
  # Create leads table for OSR qualification funnel

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `name` (text) - Lead's full name
      - `email` (text, unique) - Lead's email address
      - `whatsapp` (text, optional) - WhatsApp number
      - `proof_of_funds` (boolean) - Can show AUD $60K-$70K
      - `application_costs` (boolean) - Can afford AUD $15K-$30K
      - `service_fee` (boolean) - Ready to pay $999
      - `is_qualified` (boolean) - All three answers are yes
      - `source_page` (text) - Where they came from
      - `created_at` (timestamptz) - When they submitted
      - `updated_at` (timestamptz) - Last update time

  2. Security
    - Enable RLS on `leads` table
    - Add policy for service role to manage all leads
    - Add policy for anonymous users to insert their own leads
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  whatsapp text,
  proof_of_funds boolean NOT NULL DEFAULT false,
  application_costs boolean NOT NULL DEFAULT false,
  service_fee boolean NOT NULL DEFAULT false,
  is_qualified boolean NOT NULL DEFAULT false,
  source_page text DEFAULT 'qualification',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous users to insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow service role to manage all leads"
  ON leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_is_qualified ON leads(is_qualified);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);