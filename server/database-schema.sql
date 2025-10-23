-- Database Schema for Cold Mailer
-- Run this to create all required tables

-- Drop existing tables (careful in production!)
DROP TABLE IF EXISTS click_tracking CASCADE;
DROP TABLE IF EXISTS sent_emails CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS sequences CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    profile_picture VARCHAR(500),
    google_id VARCHAR(255) UNIQUE,
    refresh_token TEXT,
    access_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaigns table
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    company VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, email)
);

-- Templates table
CREATE TABLE templates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sent emails table
CREATE TABLE sent_emails (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    gmail_message_id VARCHAR(255),
    subject VARCHAR(500),
    body TEXT,
    status VARCHAR(50) DEFAULT 'sent',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP
);

-- Email queue table
CREATE TABLE email_queue (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(500),
    body TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    scheduled_for TIMESTAMP,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Click tracking table
CREATE TABLE click_tracking (
    id SERIAL PRIMARY KEY,
    sent_email_id INTEGER REFERENCES sent_emails(id) ON DELETE CASCADE,
    url TEXT,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT
);

-- Sequences table (for follow-up emails)
CREATE TABLE sequences (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255),
    delay_days INTEGER DEFAULT 1,
    subject VARCHAR(500),
    body TEXT,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_sent_emails_campaign_id ON sent_emails(campaign_id);
CREATE INDEX idx_sent_emails_contact_id ON sent_emails(contact_id);
CREATE INDEX idx_sent_emails_user_id ON sent_emails(user_id);
CREATE INDEX idx_sent_emails_sent_at ON sent_emails(sent_at);
CREATE INDEX idx_click_tracking_sent_email_id ON click_tracking(sent_email_id);
CREATE INDEX idx_email_queue_status ON email_queue(status);

-- Insert a test user (optional - remove in production)
-- INSERT INTO users (email, name, google_id) VALUES ('test@example.com', 'Test User', 'google123');

COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE campaigns IS 'Email campaigns created by users';
COMMENT ON TABLE contacts IS 'Email recipients/leads';
COMMENT ON TABLE sent_emails IS 'Track all sent emails';
COMMENT ON TABLE click_tracking IS 'Track email link clicks';
COMMENT ON TABLE templates IS 'Reusable email templates';
COMMENT ON TABLE sequences IS 'Automated follow-up sequences';
COMMENT ON TABLE email_queue IS 'Scheduled emails waiting to be sent';
