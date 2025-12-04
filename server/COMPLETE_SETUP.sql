-- ================================================
-- mailpal - COMPLETE DATABASE SETUP
-- ================================================
-- Version: 2.0 - Clean Architecture
-- Last Updated: December 2025
-- 
-- Run this file in your PostgreSQL database:
-- psql -U postgres -d mailpal -f COMPLETE_SETUP.sql
--
-- Or in psql: \i COMPLETE_SETUP.sql
-- ================================================

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- DROP EXISTING TABLES (for clean setup)
-- ================================================
-- Uncomment these lines if you want to start fresh
-- DROP TABLE IF EXISTS email_queue CASCADE;
-- DROP TABLE IF EXISTS sent_emails CASCADE;
-- DROP TABLE IF EXISTS sequences CASCADE;
-- DROP TABLE IF EXISTS campaign_contacts CASCADE;
-- DROP TABLE IF EXISTS contacts CASCADE;
-- DROP TABLE IF EXISTS campaigns CASCADE;
-- DROP TABLE IF EXISTS templates CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ================================================
-- 1. USERS TABLE
-- ================================================
-- Stores authenticated users via Google OAuth
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    profile_picture TEXT,
    refresh_token TEXT NOT NULL,
    access_token TEXT,
    token_expires_at TIMESTAMP,
    is_admin BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ================================================
-- 2. CONTACTS TABLE (Personal/Compose Contacts)
-- ================================================
-- Personal contacts for compose page - NOT tied to any campaign
-- Each user has their own contact list
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Each user can only have one contact per email
    CONSTRAINT contacts_user_email_unique UNIQUE(user_id, email)
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_is_favorite ON contacts(is_favorite);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON contacts(is_active);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);

-- ================================================
-- 3. CAMPAIGNS TABLE
-- ================================================
-- Email campaigns for bulk sending
CREATE TABLE IF NOT EXISTS campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject TEXT,
    body TEXT,
    status VARCHAR(50) DEFAULT 'draft',  -- draft, active, paused, completed, cancelled
    daily_limit INTEGER DEFAULT 50,
    delay_min INTEGER DEFAULT 5,          -- Min seconds between emails
    delay_max INTEGER DEFAULT 15,         -- Max seconds between emails
    track_opens BOOLEAN DEFAULT false,
    track_clicks BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- ================================================
-- 4. CAMPAIGN_CONTACTS TABLE (Campaign Recipients)
-- ================================================
-- Contacts specific to a campaign - separate from personal contacts
-- This allows the same email to be in multiple campaigns
CREATE TABLE IF NOT EXISTS campaign_contacts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',  -- pending, sent, failed, bounced, replied
    sent_at TIMESTAMP,
    error_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Same email can only be added once per campaign
    CONSTRAINT campaign_contacts_campaign_email_unique UNIQUE(campaign_id, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_user_id ON campaign_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_email ON campaign_contacts(email);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_status ON campaign_contacts(status);
CREATE INDEX IF NOT EXISTS idx_campaign_contacts_is_active ON campaign_contacts(is_active);

-- ================================================
-- 5. EMAIL SEQUENCES TABLE
-- ================================================
-- Follow-up sequences for campaigns
CREATE TABLE IF NOT EXISTS sequences (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    delay_days INTEGER NOT NULL DEFAULT 1,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    stop_on_reply BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT sequences_campaign_step_unique UNIQUE(campaign_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_sequences_campaign_id ON sequences(campaign_id);

-- ================================================
-- 6. SENT_EMAILS TABLE
-- ================================================
-- Log of all sent emails (both compose and campaign)
CREATE TABLE IF NOT EXISTS sent_emails (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_contact_id INTEGER REFERENCES campaign_contacts(id) ON DELETE SET NULL,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    sequence_step INTEGER DEFAULT 1,
    gmail_message_id VARCHAR(255),
    thread_id VARCHAR(255),
    subject TEXT NOT NULL,
    body TEXT,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    attachments JSONB DEFAULT '[]',
    status VARCHAR(50) DEFAULT 'sent',  -- sent, delivered, opened, clicked, bounced, failed
    is_compose BOOLEAN DEFAULT false,    -- true if sent from compose page
    error_message TEXT,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    sent_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_campaign_id ON sent_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_recipient_email ON sent_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_gmail_message_id ON sent_emails(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON sent_emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_sent_emails_is_compose ON sent_emails(is_compose);
CREATE INDEX IF NOT EXISTS idx_sent_emails_status ON sent_emails(status);

-- ================================================
-- 7. EMAIL_QUEUE TABLE
-- ================================================
-- Queue for scheduled campaign emails
CREATE TABLE IF NOT EXISTS email_queue (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    campaign_contact_id INTEGER NOT NULL REFERENCES campaign_contacts(id) ON DELETE CASCADE,
    sequence_step INTEGER DEFAULT 1,
    scheduled_for TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, processing, completed, failed, cancelled
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_user_id ON email_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_email_queue_campaign_id ON email_queue(campaign_id);

-- ================================================
-- 8. TEMPLATES TABLE
-- ================================================
-- Email templates (both system and user-created)
CREATE TABLE IF NOT EXISTS templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,  -- NULL for system templates
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'general',  -- campaign, compose, general
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB DEFAULT '[]',          -- List of {{variables}} used
    is_public BOOLEAN DEFAULT false,       -- System templates are public
    is_favorite BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_favorite ON templates(is_favorite);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);

-- ================================================
-- 9. VIEWS FOR ANALYTICS
-- ================================================

-- Campaign performance view
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.user_id,
    c.status,
    c.created_at,
    COUNT(DISTINCT cc.id) AS total_contacts,
    COUNT(DISTINCT CASE WHEN cc.status = 'sent' THEN cc.id END) AS sent_count,
    COUNT(DISTINCT CASE WHEN cc.status = 'failed' THEN cc.id END) AS failed_count,
    COUNT(DISTINCT CASE WHEN cc.status = 'pending' THEN cc.id END) AS pending_count,
    COUNT(DISTINCT se.id) AS emails_sent
FROM campaigns c
LEFT JOIN campaign_contacts cc ON c.id = cc.campaign_id AND cc.is_active = true
LEFT JOIN sent_emails se ON c.id = se.campaign_id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.user_id, c.status, c.created_at;

-- User email stats view
CREATE OR REPLACE VIEW user_email_stats AS
SELECT 
    u.id AS user_id,
    u.email AS user_email,
    COUNT(DISTINCT se.id) AS total_sent,
    COUNT(DISTINCT CASE WHEN se.sent_at >= CURRENT_DATE THEN se.id END) AS sent_today,
    COUNT(DISTINCT CASE WHEN se.sent_at >= CURRENT_DATE - INTERVAL '7 days' THEN se.id END) AS sent_this_week,
    COUNT(DISTINCT CASE WHEN se.is_compose = true THEN se.id END) AS compose_emails,
    COUNT(DISTINCT CASE WHEN se.is_compose = false THEN se.id END) AS campaign_emails,
    COUNT(DISTINCT c.id) AS total_campaigns,
    COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) AS active_campaigns,
    COUNT(DISTINCT co.id) AS total_contacts
FROM users u
LEFT JOIN sent_emails se ON u.id = se.user_id
LEFT JOIN campaigns c ON u.id = c.user_id AND c.is_active = true
LEFT JOIN contacts co ON u.id = co.user_id AND co.is_active = true
WHERE u.is_active = true
GROUP BY u.id, u.email;

-- ================================================
-- 10. DEFAULT TEMPLATES
-- ================================================
INSERT INTO templates (user_id, name, category, subject, body, variables, is_public) VALUES
-- Campaign Templates (with variables)
(NULL, 'Job Application', 'campaign', 
'Application for {{position}} at {{company}}', 
'Hi {{name}},

I am writing to express my interest in the {{position}} position at {{company}}. With my background in {{skill}}, I believe I would be a valuable addition to your team.

I would love the opportunity to discuss how my experience aligns with your needs.

Best regards,
{{sender_name}}',
'["name", "position", "company", "skill", "sender_name"]'::jsonb, true),

(NULL, 'Follow Up', 'campaign', 
'Following up on my application - {{position}}',
'Hi {{name}},

I wanted to follow up on my application for the {{position}} role at {{company}}. I remain very interested in this opportunity and would welcome the chance to discuss my qualifications.

Please let me know if there''s any additional information I can provide.

Best regards,
{{sender_name}}',
'["name", "position", "company", "sender_name"]'::jsonb, true),

(NULL, 'Sales Outreach', 'campaign', 
'Quick question about {{company}}',
'Hi {{name}},

I noticed {{company}} has been growing rapidly. Many companies in your space are looking for solutions to {{pain_point}}.

Would you be open to a brief call to explore if we might be able to help?

Best,
{{sender_name}}',
'["name", "company", "pain_point", "sender_name"]'::jsonb, true),

(NULL, 'Meeting Request', 'campaign', 
'Meeting Request - {{topic}}',
'Hi {{name}},

I hope this email finds you well. I would like to schedule a meeting to discuss {{topic}}.

Would you be available for a {{duration}} call this week? Please let me know what times work best for you.

Best regards,
{{sender_name}}',
'["name", "topic", "duration", "sender_name"]'::jsonb, true),

(NULL, 'Partnership Proposal', 'campaign', 
'Partnership Opportunity with {{sender_company}}',
'Hi {{name}},

My name is {{sender_name}} and I recently came across {{company}}. I was impressed by your work in {{industry}}.

I believe there could be great synergy between our organizations. Would you be open to exploring a potential partnership?

Best regards,
{{sender_name}}
{{sender_company}}',
'["name", "company", "industry", "sender_name", "sender_company"]'::jsonb, true),

-- Compose Templates (no variables)
(NULL, 'Professional Thank You', 'compose', 
'Thank You',
'Dear Sir/Madam,

Thank you for taking the time to speak with me. I really enjoyed learning more about the opportunity and your organization.

I am very excited about the possibility of joining your team and contributing to your success.

Best regards',
'[]'::jsonb, true),

(NULL, 'Meeting Confirmation', 'compose', 
'Meeting Confirmation',
'Hi,

This is to confirm our meeting scheduled for [DATE] at [TIME].

Please let me know if you need to reschedule or if there''s anything specific you''d like me to prepare.

Looking forward to our discussion.

Best regards',
'[]'::jsonb, true),

(NULL, 'Quick Check-in', 'compose', 
'Quick Check-in',
'Hi,

I hope you''re doing well. I wanted to reach out and see how things are going on your end.

If there''s anything I can help with, please don''t hesitate to let me know.

Best regards',
'[]'::jsonb, true),

(NULL, 'Information Request', 'compose', 
'Information Request',
'Hi,

I hope this email finds you well. I am reaching out to request some information regarding [TOPIC].

Specifically, I would like to know:
1. [Question 1]
2. [Question 2]

Thank you for your time and assistance.

Best regards',
'[]'::jsonb, true),

(NULL, 'Apology Email', 'compose', 
'Apology',
'Hi,

I wanted to reach out and sincerely apologize for [REASON]. This was not intentional and I take full responsibility.

I am taking steps to ensure this doesn''t happen again. Please let me know if there''s anything I can do to make this right.

Best regards',
'[]'::jsonb, true)
ON CONFLICT DO NOTHING;

-- ================================================
-- 11. HELPER FUNCTIONS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaign_contacts_updated_at ON campaign_contacts;
CREATE TRIGGER update_campaign_contacts_updated_at BEFORE UPDATE ON campaign_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 12. MIGRATION FROM OLD SCHEMA (if needed)
-- ================================================
-- If migrating from old schema with 'source' column in contacts table,
-- run this migration to move campaign contacts to campaign_contacts table

DO $$
BEGIN
    -- Check if source column exists (old schema)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'source'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contacts' AND column_name = 'campaign_id'
    ) THEN
        RAISE NOTICE 'Old schema detected. Running migration...';
        
        -- Move campaign contacts to new table
        INSERT INTO campaign_contacts (campaign_id, user_id, email, name, first_name, last_name, company, job_title, custom_fields, status, is_active, created_at)
        SELECT 
            campaign_id, 
            user_id, 
            email, 
            name, 
            first_name, 
            last_name, 
            company, 
            job_title, 
            COALESCE(custom_fields, '{}'), 
            COALESCE(status, 'pending'),
            COALESCE(is_active, true),
            created_at
        FROM contacts 
        WHERE campaign_id IS NOT NULL
        ON CONFLICT (campaign_id, email) DO NOTHING;
        
        -- Delete migrated campaign contacts from contacts table
        DELETE FROM contacts WHERE campaign_id IS NOT NULL;
        
        -- Update remaining personal contacts
        UPDATE contacts SET 
            is_favorite = COALESCE(is_favorite, false),
            is_active = COALESCE(is_active, true)
        WHERE campaign_id IS NULL;
        
        -- Drop old columns if they exist
        ALTER TABLE contacts DROP COLUMN IF EXISTS source;
        ALTER TABLE contacts DROP COLUMN IF EXISTS campaign_id;
        
        RAISE NOTICE 'Migration completed successfully!';
    ELSE
        RAISE NOTICE 'No migration needed - schema is already up to date.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Migration skipped or encountered non-critical issue: %', SQLERRM;
END $$;

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- 
-- Database Structure Summary:
-- 
-- users              - Authenticated users (Google OAuth)
-- contacts           - Personal contacts (for Compose page only)
-- campaigns          - Email campaigns
-- campaign_contacts  - Recipients for each campaign (separate from personal contacts)
-- sequences          - Follow-up email sequences
-- sent_emails        - Log of all sent emails (is_compose flag differentiates)
-- email_queue        - Scheduled emails queue
-- templates          - Email templates (system + user)
--
-- Key Design Decisions:
-- 1. Personal contacts (contacts) are SEPARATE from campaign contacts (campaign_contacts)
-- 2. No 'source' column needed - tables are separate
-- 3. Same email can exist in multiple campaigns but only once per campaign
-- 4. Personal contacts have one entry per email per user
-- 5. sent_emails tracks both compose and campaign emails via is_compose flag
--
-- Environment Variables needed in .env:
-- DB_HOST=localhost
-- DB_PORT=5432
-- DB_NAME=mailpal
-- DB_USER=postgres
-- DB_PASSWORD=your_password
