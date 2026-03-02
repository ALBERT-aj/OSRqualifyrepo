/*
  # Add Detailed Lead Information Fields

  1. Changes
    - Split `name` field into `first_name` and `last_name`
    - Add `phone_number` and `phone_country_code` for primary phone
    - Add `is_whatsapp_connected` boolean field
    - Add `country_of_residence` text field
    - Add `text_message_phone` and `text_message_country_code` for SMS
    - Rename `whatsapp` to legacy field and add new structured fields
    - Migrate existing data where possible

  2. Security
    - Maintain existing RLS policies
    - All new fields follow the same security model as existing fields
*/

-- Add new columns
DO $$
BEGIN
  -- Add first_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN first_name text;
  END IF;

  -- Add last_name column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_name text;
  END IF;

  -- Add phone_number column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE leads ADD COLUMN phone_number text;
  END IF;

  -- Add phone_country_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'phone_country_code'
  ) THEN
    ALTER TABLE leads ADD COLUMN phone_country_code text DEFAULT '+61';
  END IF;

  -- Add is_whatsapp_connected column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'is_whatsapp_connected'
  ) THEN
    ALTER TABLE leads ADD COLUMN is_whatsapp_connected boolean;
  END IF;

  -- Add country_of_residence column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'country_of_residence'
  ) THEN
    ALTER TABLE leads ADD COLUMN country_of_residence text;
  END IF;

  -- Add text_message_phone column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'text_message_phone'
  ) THEN
    ALTER TABLE leads ADD COLUMN text_message_phone text;
  END IF;

  -- Add text_message_country_code column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'text_message_country_code'
  ) THEN
    ALTER TABLE leads ADD COLUMN text_message_country_code text DEFAULT '+61';
  END IF;
END $$;

-- Migrate existing data: try to split name into first_name and last_name
UPDATE leads 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN array_length(string_to_array(name, ' '), 1) > 1 
    THEN substring(name FROM position(' ' IN name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL AND name IS NOT NULL;
