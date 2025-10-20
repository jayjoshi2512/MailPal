-- ================================================
-- CAMPAIGNS TABLE
-- ================================================
-- Stores email campaigns created by users

CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, running, paused, completed
    daily_limit INTEGER DEFAULT 50, -- Max emails per day
    delay_min INTEGER DEFAULT 5, -- Min delay between emails (minutes)
    delay_max INTEGER DEFAULT 15, -- Max delay between emails (minutes)
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Campaigns table
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Sample data for testing
INSERT INTO campaigns (user_id, name, subject, body, status) 
VALUES (1, 'Test Campaign', 'Hello {{firstName}}', 'Hi {{firstName}},\n\nThis is a test email.\n\nBest,\nTest User', 'draft');
