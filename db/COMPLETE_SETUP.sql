-- ================================================
-- COMPLETE DATABASE SETUP FOR COLD MAILER
-- ================================================
-- Run this file in your PostgreSQL database to create all tables
-- Prerequisites: Create a database first (e.g., CREATE DATABASE cold_mailer;)
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
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    daily_limit INTEGER DEFAULT 50,
    delay_min INTEGER DEFAULT 5,
    delay_max INTEGER DEFAULT 15,
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- ================================================
-- 3. CONTACTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_campaign_id ON contacts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);

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
    tracking_pixel_id VARCHAR(255) UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP,
    open_count INTEGER DEFAULT 0,
    clicked_at TIMESTAMP,
    click_count INTEGER DEFAULT 0,
    replied_at TIMESTAMP,
    bounced_at TIMESTAMP,
    bounce_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sent_emails_campaign_id ON sent_emails(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_contact_id ON sent_emails(contact_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_sent_emails_tracking_pixel_id ON sent_emails(tracking_pixel_id);
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
    category VARCHAR(100),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    use_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON templates(is_public);

-- ================================================
-- 8. CAMPAIGN ANALYTICS VIEW
-- ================================================
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT 
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.user_id,
    COUNT(DISTINCT co.id) AS total_contacts,
    COUNT(DISTINCT se.id) AS total_sent,
    COUNT(DISTINCT CASE WHEN se.opened_at IS NOT NULL THEN se.id END) AS total_opened,
    COUNT(DISTINCT CASE WHEN se.clicked_at IS NOT NULL THEN se.id END) AS total_clicked,
    COUNT(DISTINCT CASE WHEN se.replied_at IS NOT NULL THEN se.id END) AS total_replied,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.opened_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS open_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.clicked_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS click_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN se.replied_at IS NOT NULL THEN se.id END)::NUMERIC / 
        NULLIF(COUNT(DISTINCT se.id), 0) * 100, 
        2
    ) AS reply_rate
FROM campaigns c
LEFT JOIN contacts co ON c.id = co.campaign_id
LEFT JOIN sent_emails se ON c.id = se.campaign_id
GROUP BY c.id, c.name, c.user_id;

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- Your database is now ready. Make sure your .env has:
-- DATABASE_URL=postgresql://username:password@localhost:5432/cold_mailer
