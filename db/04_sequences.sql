-- ================================================
-- EMAIL SEQUENCES TABLE
-- ================================================
-- Stores follow-up emails for campaigns

CREATE TABLE sequences (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL, -- 1 = initial, 2 = first follow-up, 3 = second follow-up
    delay_days INTEGER NOT NULL, -- 0, 3, 7, etc.
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    stop_on_reply BOOLEAN DEFAULT true, -- Stop sequence if recipient replies
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, step_number)
);
