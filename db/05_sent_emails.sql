-- ================================================
-- SENT EMAILS TABLE
-- ================================================
-- Tracks all sent emails and their analytics

CREATE TABLE sent_emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_step INTEGER DEFAULT 1, -- Which email in sequence (1, 2, 3...)
    gmail_message_id VARCHAR(255), -- Gmail's message ID for reply detection
    tracking_pixel_id VARCHAR(255) UNIQUE, -- Unique ID for open tracking
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP, -- First open time
    open_count INTEGER DEFAULT 0, -- Total opens
    clicked_at TIMESTAMP, -- First click time
    click_count INTEGER DEFAULT 0, -- Total clicks
    replied_at TIMESTAMP,
    bounced_at TIMESTAMP,
    bounce_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Sent Emails table
CREATE INDEX idx_sent_emails_campaign_id ON sent_emails(campaign_id);
CREATE INDEX idx_sent_emails_contact_id ON sent_emails(contact_id);
CREATE INDEX idx_sent_emails_tracking_pixel_id ON sent_emails(tracking_pixel_id);
CREATE INDEX idx_sent_emails_gmail_message_id ON sent_emails(gmail_message_id);
CREATE INDEX idx_sent_emails_sent_at ON sent_emails(sent_at);
