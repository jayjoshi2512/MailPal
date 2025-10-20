-- ================================================
-- MAINTENANCE AND CLEANUP SCRIPTS
-- ================================================
-- Run these periodically to keep the database clean

-- Delete old processed queue items (older than 30 days)
-- Run this periodically via cron job or scheduled task
-- DELETE FROM email_queue WHERE status = 'sent' AND processed_at < NOW() - INTERVAL '30 days';

-- Delete old tracking data (older than 90 days)
-- DELETE FROM click_tracking WHERE clicked_at < NOW() - INTERVAL '90 days';

-- Update campaign status to completed if all emails are sent
-- UPDATE campaigns 
-- SET status = 'completed', updated_at = NOW()
-- WHERE status = 'running' 
-- AND id NOT IN (
--     SELECT DISTINCT campaign_id 
--     FROM email_queue 
--     WHERE status IN ('pending', 'processing')
-- );

-- Reset failed emails for retry (be careful with this)
-- UPDATE email_queue 
-- SET status = 'pending', retry_count = 0, error_message = NULL
-- WHERE status = 'failed' AND retry_count < max_retries;
