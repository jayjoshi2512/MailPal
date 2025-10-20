-- ================================================
-- EMAIL QUEUE TABLE
-- ================================================
-- Manages scheduled emails waiting to be sent

CREATE TABLE email_queue (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_step INTEGER DEFAULT 1,
    scheduled_for TIMESTAMP NOT NULL, -- When to send this email
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, sent, failed, cancelled
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Indexes for Email Queue table
CREATE INDEX idx_email_queue_scheduled ON email_queue(scheduled_for, status);
CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_user_id ON email_queue(user_id);
