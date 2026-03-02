/*
  # Remove Google Sheets Webhook

  1. Cleanup
    - Drop the trigger for unqualified leads
    - Drop the notification function
    - Keep the leads table intact with all data
*/

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_unqualified_lead ON leads;

-- Drop function if exists
DROP FUNCTION IF EXISTS notify_unqualified_lead();
