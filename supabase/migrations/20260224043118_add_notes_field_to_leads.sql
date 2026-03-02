/*
  # Add Notes Field to Leads Table

  1. Changes
    - Add `notes` text field to store additional information about leads
    - This will be used to track duplicate submissions and other important notes

  2. Security
    - Maintain existing RLS policies
    - Notes field follows the same security model as existing fields
*/

-- Add notes column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes text;
  END IF;
END $$;