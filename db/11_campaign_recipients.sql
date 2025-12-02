-- ================================================
-- CAMPAIGN RECIPIENTS TABLE
-- ================================================
-- Stores recipients for campaigns (separate from contacts)

CREATE TABLE IF NOT EXISTS campaign_recipients (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    variables JSONB DEFAULT '{}', -- Store all CSV variables: {"name": "John", "company": "Acme"}
    status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign_id ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
