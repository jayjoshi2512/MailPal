-- ================================================
-- COMPLETE DATABASE SETUP FOR MAILKAR
-- ================================================
-- Run this file in your PostgreSQL database to create all tables
-- Prerequisites: Create a database first (e.g., CREATE DATABASE mailkar;)
-- Then connect to it and run this file

-- ================================================
-- 1. USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    profile_picture TEXT,
    refresh_token TEXT NOT NULL,
    access_token TEXT,
    token_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ================================================
-- 2. CAMPAIGNS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject TEXT,
    body TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    daily_limit INTEGER DEFAULT 50,
    delay_min INTEGER DEFAULT 5,
    delay_max INTEGER DEFAULT 15,
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    attachments JSONB DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);

-- ================================================
-- 3. CONTACTS TABLE
-- ================================================
-- PERSONAL CONTACTS: source = 'compose' (for Compose page)
-- CAMPAIGN CONTACTS: source = 'campaign' (tied to a specific campaign)
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    source VARCHAR(50) DEFAULT 'compose',
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, email, source, campaign_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_id ON contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);

-- ================================================
-- 4. EMAIL SEQUENCES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS sequences (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_days INTEGER NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    stop_on_reply BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, step_number)
);

-- ================================================
-- 5. SENT EMAILS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS sent_emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_step INTEGER DEFAULT 1,
    gmail_message_id VARCHAR(255),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_emails_campaign_id ON sent_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_contact_id ON sent_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_gmail_message_id ON sent_emails(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON sent_emails(sent_at);

-- ================================================
-- 6. EMAIL QUEUE TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS email_queue (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sequence_step INTEGER DEFAULT 1,
    scheduled_for TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);

-- ================================================
-- 7. TEMPLATES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'campaign',
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON templates(is_favorite);

-- ================================================
-- 8. INSERT DEFAULT TEMPLATES
-- ================================================
INSERT INTO templates (user_id, name, category, subject, body, is_public) VALUES
-- Campaign Templates (with variables)
(NULL, 'Job Application', 'campaign', 'Application for {{position}} at {{company}}', 
'Hi {{name}},

I am writing to express my interest in the {{position}} position at {{company}}. With my background in {{skill}}, I believe I would be a valuable addition to your team.

I would love the opportunity to discuss how my experience aligns with your needs.

Best regards,
{{sender_name}}', true),

(NULL, 'Follow Up', 'campaign', 'Following up on my application - {{position}}',
'Hi {{name}},

I wanted to follow up on my application for the {{position}} role at {{company}}. I remain very interested in this opportunity and would welcome the chance to discuss my qualifications.

Please let me know if there''s any additional information I can provide.

Best regards,
{{sender_name}}', true),

(NULL, 'Sales Outreach', 'campaign', 'Quick question about {{company}}',
'Hi {{name}},

I noticed {{company}} has been growing rapidly. Many companies in your space are looking for solutions to {{pain_point}}.

Would you be open to a brief call to explore if we might be able to help?

Best,
{{sender_name}}', true),

(NULL, 'Meeting Request', 'campaign', 'Meeting Request - {{topic}}',
'Hi {{name}},

I hope this email finds you well. I would like to schedule a meeting to discuss {{topic}}.

Would you be available for a {{duration}} call this week? Please let me know what times work best for you.

Best regards,
{{sender_name}}', true),

(NULL, 'Introduction', 'campaign', 'Introduction from {{sender_name}}',
'Hi {{name}},

My name is {{sender_name}} and I recently came across {{company}}. I was impressed by your work in {{industry}}.

I would love to connect and learn more about your journey. Would you be open to a brief conversation?

Best regards,
{{sender_name}}', true),

-- Compose Templates (no variables)
(NULL, 'Professional Thank You', 'compose', 'Thank You',
'Dear Sir/Madam,

Thank you for taking the time to speak with me. I really enjoyed learning more about the opportunity and your organization.

I am very excited about the possibility of joining your team and contributing to your success.

Best regards', true),

(NULL, 'Meeting Confirmation', 'compose', 'Meeting Confirmation',
'Hi,

This is to confirm our meeting scheduled for [DATE] at [TIME].

Please let me know if you need to reschedule or if there''s anything specific you''d like me to prepare.

Looking forward to our discussion.

Best regards', true),

(NULL, 'Quick Check-in', 'compose', 'Quick Check-in',
'Hi,

I hope you''re doing well. I wanted to reach out and see how things are going on your end.

If there''s anything I can help with, please don''t hesitate to let me know.

Best regards', true),

(NULL, 'Information Request', 'compose', 'Information Request',
'Hi,

I hope this email finds you well. I am reaching out to request some information regarding [TOPIC].

Specifically, I would like to know:
1. [Question 1]
2. [Question 2]

Thank you for your time and assistance.

Best regards', true),

(NULL, 'Apology Email', 'compose', 'Apology',
'Hi,

I wanted to reach out and sincerely apologize for [REASON]. This was not intentional and I take full responsibility.

I am taking steps to ensure this doesn''t happen again. Please let me know if there''s anything I can do to make this right.

Best regards', true)
ON CONFLICT DO NOTHING;

-- ================================================
-- 9. CAMPAIGN ANALYTICS VIEW
-- ================================================
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.user_id,
    COUNT(DISTINCT se.id) AS total_sent
FROM campaigns c
LEFT JOIN sent_emails se ON c.id = se.campaign_id
WHERE c.is_active = true OR c.is_active IS NULL
GROUP BY c.id, c.name, c.user_id;

-- ================================================
-- MIGRATION: For existing databases, run these:
-- ================================================
-- These ALTER statements will add missing columns to existing tables
-- They won't fail if columns already exist (PostgreSQL 9.6+)

-- Campaigns table updates
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL;

-- Contacts table updates
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'compose';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE;

-- Templates table updates
ALTER TABLE templates ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'campaign';
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT false;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;

-- Users table updates
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Sent emails - add status column for tracking
ALTER TABLE sent_emails ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'sent';

-- Create missing indexes (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_source ON contacts(source);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_id ON contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON templates(is_favorite);

-- Update existing contacts: 
-- Set source='compose' for personal contacts (no campaign_id)
-- Set source='campaign' for campaign contacts (has campaign_id)
UPDATE contacts SET source = 'compose' WHERE source IS NULL AND campaign_id IS NULL;
UPDATE contacts SET source = 'campaign' WHERE campaign_id IS NOT NULL AND source != 'campaign';

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- Your database is now ready. Make sure your .env has:
-- DB_HOST=localhost
-- DB_PORT=5432
-- DB_NAME=mailkar
-- DB_USER=postgres
-- DB_PASSWORD=your_password
