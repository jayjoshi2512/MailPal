-- ================================================
-- CONTACTS TABLE
-- ================================================
-- Stores recipients for each campaign

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}', -- Store any extra data: {"location": "NYC", "industry": "Tech"}
    status VARCHAR(50) DEFAULT 'pending', -- pending, queued, sent, opened, clicked, replied, bounced, failed
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(campaign_id, email) -- Prevent duplicate emails in same campaign
);

-- Indexes for Contacts table
CREATE INDEX idx_contacts_campaign_id ON contacts(campaign_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);

-- Sample data for testing
INSERT INTO contacts (campaign_id, email, first_name, last_name, company) 
VALUES 
(1, 'john@example.com', 'John', 'Doe', 'Acme Corp'),
(1, 'jane@example.com', 'Jane', 'Smith', 'TechCo');
