/*
  # Fix RLS Policy Security Issue

  1. Security
    - Drop the overly permissive RLS policy "Anonymous users can insert leads"
    - Create a restrictive policy that validates all required fields
    - Ensures anonymous users can only insert leads with complete, valid data
    - Prevents bypassing the qualification questions
    - Validates email format to prevent spam

  ## Important Notes
  - The new RLS policy ensures data integrity and prevents abuse
  - All required fields must be provided (first_name, last_name, email, phone)
  - All three qualification questions must be answered
  - is_qualified must correctly reflect the answers
  - Email must be in valid format
*/

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anonymous users can insert leads" ON leads;

-- Create a restrictive policy for anonymous users
CREATE POLICY "Anonymous users can submit valid qualification forms"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Must provide all required personal information
    first_name IS NOT NULL AND 
    first_name != '' AND
    last_name IS NOT NULL AND
    last_name != '' AND
    email IS NOT NULL AND 
    email != '' AND
    email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
    phone_number IS NOT NULL AND
    phone_number != '' AND
    -- Must explicitly answer all three qualification questions
    proof_of_funds IS NOT NULL AND
    application_costs IS NOT NULL AND
    service_fee IS NOT NULL AND
    -- is_qualified must match the actual answers
    is_qualified = (proof_of_funds AND application_costs AND service_fee)
  );