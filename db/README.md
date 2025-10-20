# MailKar Database Schema

This folder contains all SQL files for setting up the MailKar PostgreSQL database.

## Setup Instructions

### 1. Create Database
First, create the database using PostgreSQL (pgAdmin or command line):

```sql
CREATE DATABASE mailkar
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_India.1252'
    LC_CTYPE = 'English_India.1252'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;
```

### 2. Execute SQL Files in Order
Execute the SQL files in numerical order using pgAdmin's Query Tool or psql command line:

1. **01_users.sql** - Creates users table and indexes
2. **02_campaigns.sql** - Creates campaigns table and indexes
3. **03_contacts.sql** - Creates contacts table and indexes
4. **04_sequences.sql** - Creates email sequences table
5. **05_sent_emails.sql** - Creates sent emails tracking table
6. **06_email_queue.sql** - Creates email queue table
7. **07_click_tracking.sql** - Creates click tracking table
8. **08_templates.sql** - Creates email templates table
9. **09_views.sql** - Creates analytics views
10. **10_maintenance.sql** - Contains maintenance queries (for reference)

### Using pgAdmin:
1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Right-click on the `mailkar` database → Query Tool
4. Open each `.sql` file and execute them in order
5. Verify tables are created in the Tables section

### Using psql Command Line:
```bash
psql -U postgres -d mailkar -f 01_users.sql
psql -U postgres -d mailkar -f 02_campaigns.sql
psql -U postgres -d mailkar -f 03_contacts.sql
psql -U postgres -d mailkar -f 04_sequences.sql
psql -U postgres -d mailkar -f 05_sent_emails.sql
psql -U postgres -d mailkar -f 06_email_queue.sql
psql -U postgres -d mailkar -f 07_click_tracking.sql
psql -U postgres -d mailkar -f 08_templates.sql
psql -U postgres -d mailkar -f 09_views.sql
```

## Database Schema Overview

### Core Tables

#### **users**
Stores user authentication data from Google OAuth
- Primary authentication table
- Links to all user-specific data

#### **campaigns**
Email campaign configurations
- Campaign settings (daily limits, delays)
- Tracking preferences

#### **contacts**
Campaign recipients
- Contact information
- Custom fields (JSONB for flexibility)
- Status tracking

#### **sequences**
Multi-step email sequences
- Follow-up emails
- Timing configurations

#### **sent_emails**
Email delivery and engagement tracking
- Open/click analytics
- Reply detection
- Bounce handling

#### **email_queue**
Scheduled email management
- Queue processing
- Retry logic
- Error handling

#### **click_tracking**
Individual link click tracking
- URL rewrites
- Click analytics

#### **templates**
Reusable email templates
- User templates
- System templates
- Category organization

### Views

#### **campaign_analytics**
Pre-computed campaign statistics
- Open rates
- Click rates
- Reply rates
- Total counts

## Relationships

```
users (1) ──→ (many) campaigns
campaigns (1) ──→ (many) contacts
campaigns (1) ──→ (many) sequences
campaigns (1) ──→ (many) sent_emails
contacts (1) ──→ (many) sent_emails
users (1) ──→ (many) templates
sent_emails (1) ──→ (many) click_tracking
```

## Indexes

All tables include appropriate indexes for:
- Primary keys (automatic)
- Foreign keys
- Frequently queried columns
- Composite indexes for complex queries

## Best Practices

1. **Always use transactions** when inserting related data
2. **Encrypt sensitive data** (tokens, refresh tokens) in production
3. **Regular backups** - PostgreSQL pg_dump
4. **Monitor query performance** - use EXPLAIN ANALYZE
5. **Run maintenance scripts** periodically (see 10_maintenance.sql)
6. **Use connection pooling** in your application (pg-pool)

## Sample Data

The SQL files include minimal sample data for testing. Remove or modify this for production use.

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit real refresh tokens or access tokens
- Use environment variables for database credentials
- Implement proper encryption for sensitive fields
- Use SSL/TLS for database connections in production
- Implement proper access controls and user permissions
