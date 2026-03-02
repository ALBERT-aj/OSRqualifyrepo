/*
  # Add Webhook for Unqualified Leads

  1. Database Trigger
    - Create a trigger that fires after INSERT on `leads` table
    - Calls the edge function `log-unqualified-leads` via webhook
    - Only processes unqualified leads (is_qualified = false)

  2. Setup
    - Uses Supabase's built-in http extension to make POST requests
    - Sends lead data to the edge function
    - Edge function handles Google Sheets logging

  ## Important Notes
  - The trigger uses pg_net for async HTTP requests
  - Requires the pg_net extension to be enabled
  - The edge function URL uses the project's Supabase URL
*/

-- Enable the pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION notify_unqualified_lead()
RETURNS TRIGGER AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Only process unqualified leads
  IF NEW.is_qualified = false THEN
    -- Get the Supabase URL from settings
    supabase_url := current_setting('app.settings.supabase_url', true);
    service_role_key := current_setting('app.settings.service_role_key', true);
    
    -- If settings are not available, construct from environment
    IF supabase_url IS NULL THEN
      supabase_url := 'https://' || current_setting('request.headers', true)::json->>'host';
    END IF;

    -- Make async HTTP request to edge function
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/log-unqualified-leads',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )
    ) INTO request_id;

    RAISE LOG 'Webhook triggered for unqualified lead: % (request_id: %)', NEW.email, request_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after insert
DROP TRIGGER IF EXISTS trigger_unqualified_lead ON leads;
CREATE TRIGGER trigger_unqualified_lead
  AFTER INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION notify_unqualified_lead();
