-- ================================================
-- TEMPLATES TABLE
-- ================================================
-- Stores reusable email templates

CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL for system templates
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- job_application, sales_outreach, partnership, etc.
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false, -- Share with other users?
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Templates table
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public);
