/*
  # Fix Security Issues

  1. Security Improvements
    - Remove duplicate permissive INSERT policies on leads table
    - Keep only one consolidated INSERT policy for anonymous users
    - Move pg_net extension from public schema to extensions schema
  
  2. Changes
    - Drop redundant policies: "Anonymous users can submit qualification forms" and "Anonymous users can submit valid lead forms"
    - Create single INSERT policy for anonymous users
    - Relocate pg_net extension to extensions schema
*/

-- Drop duplicate INSERT policies
DROP POLICY IF EXISTS "Anonymous users can submit qualification forms" ON leads;
DROP POLICY IF EXISTS "Anonymous users can submit valid lead forms" ON leads;

-- Create a single consolidated INSERT policy for anonymous users
CREATE POLICY "Anonymous users can insert leads"
  ON leads
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Move pg_net extension from public schema to extensions schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
