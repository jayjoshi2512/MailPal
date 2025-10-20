-- ================================================
-- USERS TABLE
-- ================================================
-- Stores user info after Google OAuth login

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    profile_picture TEXT,
    refresh_token TEXT NOT NULL, -- Store encrypted in production!
    access_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Users table
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);

-- Sample data for testing
INSERT INTO users (google_id, email, name, refresh_token) 
VALUES ('123456789', 'test@example.com', 'Test User', 'fake_refresh_token');
