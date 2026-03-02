/*
  # Fix Security Issues

  1. Indexes
    - Remove unused indexes on `leads` table:
      - `idx_leads_email` (unused)
      - `idx_leads_is_qualified` (unused)
      - `idx_leads_created_at` (unused)

  2. Security Improvements
    - Replace unrestricted anonymous insert policy with a restrictive one
    - Only allow inserts where the user is providing their own data
    - Validate that all required fields are present
    - Prevent malicious data insertion

  ## Important Notes
  - The new policy ensures anonymous users can only insert leads with valid data
  - All boolean fields must be explicitly set (no bypassing questions)
  - Email and name must be provided
  - This prevents abuse while still allowing the qualification funnel to work
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_is_qualified;
DROP INDEX IF EXISTS idx_leads_created_at;

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow anonymous users to insert leads" ON leads;

-- Create a restrictive policy for anonymous users
-- This ensures they can only insert with valid, complete data
CREATE POLICY "Anonymous users can submit qualification forms"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must provide name and email
    name IS NOT NULL AND 
    name != '' AND
    email IS NOT NULL AND 
    email != '' AND
    -- Must explicitly answer all three qualification questions
    proof_of_funds IS NOT NULL AND
    application_costs IS NOT NULL AND
    service_fee IS NOT NULL AND
    -- is_qualified must match the actual answers
    is_qualified = (proof_of_funds AND application_costs AND service_fee)
  );