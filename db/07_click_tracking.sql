-- ================================================
-- CLICK TRACKING TABLE
-- ================================================
-- Tracks individual link clicks in emails

CREATE TABLE click_tracking (
    id SERIAL PRIMARY KEY,
    sent_email_id INTEGER NOT NULL REFERENCES sent_emails(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    tracking_url VARCHAR(255) UNIQUE NOT NULL,
    clicked_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Indexes for Click Tracking table
CREATE INDEX idx_click_tracking_sent_email_id ON click_tracking(sent_email_id);
CREATE INDEX idx_click_tracking_url ON click_tracking(tracking_url);
