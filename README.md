# 📧 MailKar - Cold Email Campaign Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gmail_API-OAuth_2.0-EA4335?style=for-the-badge&logo=gmail" alt="Gmail API" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
</div>

<br />

<div align="center">
  <h3>🚀 A modern, full-stack email campaign management platform</h3>
  <p>Send personalized cold emails through Gmail with campaign tracking, contact management, AI-powered template generation, and comprehensive analytics.</p>
</div>

<br />

---

## 📑 Table of Contents

- [Features](#-features)
- [Demo Screenshots](#-demo-screenshots)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Google OAuth Setup](#-google-oauth-setup)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Security Features](#-security-features)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Security
- **Google OAuth 2.0** - Secure login with Google account
- **JWT Authentication** - Secure session management with refresh tokens
- **No Password Storage** - All authentication handled via Google
- **Protected Routes** - Client-side route protection

### 📧 Email Composition
- **Rich Text Editor** - Format your emails with bold, italic, lists, links, and more
- **Gmail Integration** - Send emails directly from your connected Gmail account
- **CC/BCC Support** - Add multiple recipients with CC and BCC fields
- **File Attachments** - Attach up to 5 files (max 10MB each) per email
- **Template Variables** - Use `{name}`, `{company}`, `{email}` placeholders for personalization
- **Draft Saving** - Auto-save drafts to prevent data loss

### 🎯 Campaign Management
- **Create Campaigns** - Build email campaigns with multiple recipients
- **Campaign Scheduling** - Schedule campaigns for later delivery
- **Progress Tracking** - Track sent/failed emails in real-time
- **Attachment Support** - Add files to entire campaigns
- **Campaign Analytics** - View performance metrics for each campaign

### 👥 Contact Management
- **CSV Import** - Bulk import contacts from CSV files
- **Manual Entry** - Add contacts one by one
- **Favorites System** - Star important contacts for quick access
- **Search & Filter** - Find contacts quickly
- **Contact Details** - Store name, email, company, and designation
- **Organized Storage** - Contacts stored per user in structured folders

### 📝 Template Library
- **Save Templates** - Save frequently used emails as templates
- **Favorite Templates** - Mark templates as favorites
- **Template Variables** - Support for dynamic placeholders
- **Quick Insert** - Insert templates directly into compose
- **Edit & Update** - Modify templates anytime

### 🤖 AI-Powered Features
- **Google Gemini AI** - Generate professional emails using AI
- **Smart Suggestions** - AI-powered subject line suggestions
- **Template Generation** - Create templates from prompts

### 📊 Analytics Dashboard
- **Email Statistics** - Total sent, campaigns created, contacts count
- **Campaign Performance** - Track campaign success rates
- **Visual Charts** - Beautiful charts powered by Recharts
- **Email Trends** - View sending patterns over time
- **Real-time Updates** - Live dashboard updates

### 🎨 User Interface
- **Modern Design** - Clean, professional UI with Tailwind CSS
- **Dark/Light Mode** - Toggle between themes
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Smooth Animations** - GSAP-powered animations
- **Toast Notifications** - Colored feedback (success/error/warning)
- **Loading Skeletons** - Smooth loading states

### 🛡️ Admin Panel
- **Email OTP Login** - Secure admin access with email verification
- **User Management** - View all registered users
- **System Statistics** - Overview of platform usage
- **Activity Monitoring** - Track user activities

---

## 🖼️ Demo Screenshots

<details>
<summary>📸 Click to View Screenshots</summary>

### Landing Page
- Modern hero section with animated card stack
- Features showcase
- Call-to-action buttons

### Dashboard
- Real-time statistics cards
- Campaign performance charts
- Email trends visualization
- Quick action buttons

### Compose Email
- Rich text editor with formatting options
- Recipient management (To, CC, BCC)
- Attachment upload
- Template selection sidebar
- Contact picker

### Campaign Management
- Campaign list with status indicators
- Campaign creation wizard
- Progress tracking
- Detailed campaign view

### Contact Management
- Contact table with sorting
- CSV import wizard
- Contact details modal
- Favorite toggling

### Templates
- Template grid view
- Template editor
- AI generation modal
- Variable placeholder support

### Settings & Profile
- Profile information display
- Theme preferences
- Connected account details

</details>

---

## 💻 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1 | UI Framework |
| Vite | 6.0 | Build Tool & Dev Server |
| Tailwind CSS | 4.0 | Styling |
| Radix UI | Latest | Accessible Components |
| React Router | 7.0 | Client-side Routing |
| GSAP | 3.x | Animations |
| Recharts | 2.x | Charts & Graphs |
| Axios | 1.x | HTTP Client |
| Sonner | Latest | Toast Notifications |
| Lucide React | Latest | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | Web Framework |
| PostgreSQL | 14+ | Database |
| pg | 8.x | PostgreSQL Client |
| JWT | Latest | Authentication |
| googleapis | Latest | Gmail API |
| Multer | 1.x | File Upload |
| Winston | 3.x | Logging |
| Helmet | 8.x | Security Headers |
| CORS | 2.x | Cross-Origin Support |
| express-rate-limit | 7.x | Rate Limiting |

---

## 🏗️ Project Structure

```
MailKar/
├── 📁 client/                     # React Frontend (Vite)
│   ├── 📁 public/
│   │   ├── 📁 Fonts/              # Custom fonts (Maorin)
│   │   └── 📁 Images/             # Static images
│   ├── 📁 src/
│   │   ├── 📁 components/         # Reusable UI components
│   │   │   ├── 📁 Compose/        # Email composition components
│   │   │   ├── 📁 Dashboard/      # Dashboard widgets
│   │   │   ├── 📁 Landing/        # Landing page components
│   │   │   ├── 📁 lib/            # Utility functions
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   ├── Sidebar.jsx        # Side navigation menu
│   │   │   ├── ProtectedRoute.jsx # Route protection HOC
│   │   │   ├── mode-toggle.tsx    # Theme toggle button
│   │   │   └── theme-provider.tsx # Theme context provider
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── 📁 pages/
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Compose.jsx        # Email composition
│   │   │   ├── LandingPage.jsx    # Public landing page
│   │   │   ├── Profile.jsx        # User profile
│   │   │   ├── Settings.jsx       # User settings
│   │   │   ├── ConnectGoogle.jsx  # OAuth connection
│   │   │   └── AuthCallback.jsx   # OAuth callback handler
│   │   ├── 📁 routes/
│   │   │   └── Routes.jsx         # Route definitions
│   │   ├── 📁 services/
│   │   │   └── api.js             # API service layer
│   │   ├── 📁 utils/              # Utility functions
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # App entry point
│   │   └── index.css              # Global styles
│   ├── components.json            # shadcn/ui config
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind configuration
│   └── package.json
│
├── 📁 server/                     # Node.js Backend (Express)
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   ├── database.js        # PostgreSQL connection
│   │   │   ├── logger.js          # Winston logger setup
│   │   │   └── index.js           # Config exports
│   │   ├── 📁 controllers/
│   │   │   ├── authController.js      # Authentication logic
│   │   │   ├── emailController.js     # Email sending logic
│   │   │   ├── campaignController.js  # Campaign management
│   │   │   ├── contactController.js   # Contact management
│   │   │   ├── dashboardController.js # Dashboard stats
│   │   │   └── uploadController.js    # File upload handling
│   │   ├── 📁 middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   ├── errorHandler.js    # Global error handling
│   │   │   ├── rateLimiter.js     # Rate limiting
│   │   │   ├── sanitize.js        # Input sanitization
│   │   │   ├── upload.js          # Multer configuration
│   │   │   └── validator.js       # Request validation
│   │   ├── 📁 routes/
│   │   │   ├── authRoutes.js      # /api/auth/*
│   │   │   ├── emailRoutes.js     # /api/emails/*
│   │   │   ├── campaignRoutes.js  # /api/campaigns/*
│   │   │   ├── contactRoutes.js   # /api/contacts/*
│   │   │   ├── dashboardRoutes.js # /api/dashboard/*
│   │   │   └── index.js           # Route aggregator
│   │   ├── 📁 services/
│   │   │   └── emailService.js    # Gmail API service
│   │   └── server.js              # Express entry point
│   ├── 📁 uploads/                # File upload storage
│   │   └── 📁 {user_email}/       # User-specific folders
│   │       └── 📁 {date}/         # Date-organized files
│   ├── 📁 logs/                   # Application logs
│   ├── 📁 migrations/             # Database migrations
│   └── package.json
│
├── 📁 db/                         # Database Schema Files
│   ├── 01_users.sql               # Users table
│   ├── 02_campaigns.sql           # Campaigns table
│   ├── 03_contacts.sql            # Contacts table
│   ├── 04_sequences.sql           # Email sequences
│   ├── 05_sent_emails.sql         # Sent emails tracking
│   ├── 06_email_queue.sql         # Email queue
│   ├── 08_templates.sql           # Email templates
│   ├── 09_views.sql               # Database views
│   └── 10_maintenance.sql         # Maintenance procedures
│
└── README.md                      # This file
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Minimum Version | Download Link |
|-------------|-----------------|---------------|
| Node.js | v18.0.0+ | [nodejs.org](https://nodejs.org/) |
| npm | v9.0.0+ | Comes with Node.js |
| PostgreSQL | v14.0+ | [postgresql.org](https://www.postgresql.org/download/) |
| Git | Latest | [git-scm.com](https://git-scm.com/) |

You'll also need:
- A **Google Cloud Project** with Gmail API enabled
- A **Google Account** for OAuth authentication

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/jayjoshi2512/Cold-Mailer.git

# Navigate to project directory
cd Cold-Mailer
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (root, client, and server)
npm run install:all

# Or install separately
cd client && npm install
cd ../server && npm install
```

### Step 3: Set Up Environment Variables

Create `.env` files in both `client` and `server` directories (see [Environment Variables](#-environment-variables) section).

### Step 4: Set Up Database

See [Database Setup](#-database-setup) section for detailed instructions.

### Step 5: Configure Google OAuth

See [Google OAuth Setup](#-google-oauth-setup) section for step-by-step guide.

### Step 6: Start Development Servers

```bash
# From root directory - runs both client and server concurrently
npm run dev

# Or run separately in different terminals
npm run dev:server  # Terminal 1: Backend on http://localhost:5000
npm run dev:client  # Terminal 2: Frontend on http://localhost:5173
```

### Step 7: Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

---

## ⚙️ Environment Variables

### Server Configuration (`server/.env`)

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mailkar
DB_USER=postgres
DB_PASSWORD=your_secure_password

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate a secure random string (at least 32 characters)
# You can use: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secure_jwt_secret_key_here

# ============================================
# GOOGLE OAUTH CONFIGURATION
# ============================================
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# ============================================
# AI CONFIGURATION (Optional - for AI templates)
# ============================================
GEMINI_API_KEY=your_google_gemini_api_key

# ============================================
# ADMIN CONFIGURATION (Optional)
# ============================================
ADMIN_EMAIL=admin@yourdomain.com
```

### Client Configuration (`client/.env`)

```env
# ============================================
# API CONFIGURATION
# ============================================
VITE_API_URL=http://localhost:5000/api
```

### Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` | ✅ | PostgreSQL host address |
| `DB_PORT` | ✅ | PostgreSQL port (default: 5432) |
| `DB_NAME` | ✅ | Database name |
| `DB_USER` | ✅ | Database username |
| `DB_PASSWORD` | ✅ | Database password |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | ✅ | Google OAuth Client Secret |
| `GOOGLE_REDIRECT_URI` | ✅ | OAuth callback URL |
| `PORT` | ❌ | Server port (default: 5000) |
| `NODE_ENV` | ❌ | Environment (development/production) |
| `CLIENT_URL` | ✅ | Frontend URL for CORS |
| `GEMINI_API_KEY` | ❌ | Google Gemini API key for AI features |
| `ADMIN_EMAIL` | ❌ | Admin email for admin panel access |

---

## 🔑 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name: `MailKar` (or your preferred name)
4. Click **"Create"**

### Step 2: Enable Gmail API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Gmail API"**
3. Click on it and press **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type (or Internal if using Google Workspace)
3. Fill in the required fields:
   - **App name**: MailKar
   - **User support email**: Your email
   - **Developer contact email**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your email for development)
6. Save and continue

### Step 4: Create OAuth Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `MailKar Web Client`
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://localhost:5000
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Click **"Create"**
8. Copy the **Client ID** and **Client Secret** to your `.env` file

### Step 5: Request Verification (for Production)

For production use with more than 100 users, you'll need to:
1. Submit your app for Google verification
2. Complete the OAuth verification process
3. Add privacy policy and terms of service URLs

---

## 🗄️ Database Setup

### Option 1: Quick Setup (Recommended)

```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Create database
CREATE DATABASE mailkar;

# 3. Connect to the new database
\c mailkar

# 4. Run the complete setup script
\i server/COMPLETE_SETUP.sql
```

### Option 2: Manual Table Creation

Run each SQL file in the `db/` directory in order:

```bash
psql -U postgres -d mailkar -f db/01_users.sql
psql -U postgres -d mailkar -f db/02_campaigns.sql
psql -U postgres -d mailkar -f db/03_contacts.sql
psql -U postgres -d mailkar -f db/04_sequences.sql
psql -U postgres -d mailkar -f db/05_sent_emails.sql
psql -U postgres -d mailkar -f db/06_email_queue.sql
psql -U postgres -d mailkar -f db/08_templates.sql
psql -U postgres -d mailkar -f db/09_views.sql
psql -U postgres -d mailkar -f db/10_maintenance.sql
```

### Database Schema Overview

```sql
-- Core Tables
users           -- User accounts (OAuth data, tokens)
campaigns       -- Email campaigns
contacts        -- Contact list per user
templates       -- Email templates
sent_emails     -- Tracking sent emails
email_queue     -- Queued emails for sending
sequences       -- Email sequences (future feature)
```

### Database Diagram

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   users     │──┬──▶│  campaigns  │      │  templates  │
└─────────────┘  │   └─────────────┘      └─────────────┘
                 │          │                    │
                 │          ▼                    │
                 │   ┌─────────────┐            │
                 ├──▶│ sent_emails │◀───────────┘
                 │   └─────────────┘
                 │
                 │   ┌─────────────┐
                 ├──▶│  contacts   │
                 │   └─────────────┘
                 │
                 │   ┌─────────────┐
                 └──▶│ email_queue │
                     └─────────────┘
```

---

## � API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/google` | Get Google OAuth URL | ❌ |
| `GET` | `/google/callback` | OAuth callback handler | ❌ |
| `GET` | `/me` | Get current user info | ✅ |
| `POST` | `/logout` | Logout and clear session | ✅ |
| `POST` | `/refresh` | Refresh access token | ✅ |

#### 📊 Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/stats` | Get dashboard statistics | ✅ |
| `GET` | `/recent-activity` | Get recent email activity | ✅ |
| `GET` | `/campaign-performance` | Get campaign metrics | ✅ |

#### 📧 Emails (`/api/emails`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/send` | Send single email | ✅ |
| `POST` | `/test` | Send test email | ✅ |
| `GET` | `/sent` | Get sent emails list | ✅ |

#### 🎯 Campaigns (`/api/campaigns`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all campaigns | ✅ |
| `POST` | `/` | Create new campaign | ✅ |
| `GET` | `/:id` | Get campaign details | ✅ |
| `PUT` | `/:id` | Update campaign | ✅ |
| `DELETE` | `/:id` | Delete campaign (soft) | ✅ |
| `POST` | `/:id/launch` | Launch campaign | ✅ |
| `POST` | `/:id/pause` | Pause campaign | ✅ |

#### 👥 Contacts (`/api/contacts`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all contacts | ✅ |
| `POST` | `/` | Add single contact | ✅ |
| `POST` | `/upload-csv` | Import contacts from CSV | ✅ |
| `GET` | `/:id` | Get contact details | ✅ |
| `PUT` | `/:id` | Update contact | ✅ |
| `DELETE` | `/:id` | Delete contact | ✅ |
| `PATCH` | `/:id/favorite` | Toggle favorite status | ✅ |

#### 📝 Templates (`/api/templates`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/` | List all templates | ✅ |
| `POST` | `/` | Create new template | ✅ |
| `GET` | `/:id` | Get template details | ✅ |
| `PATCH` | `/:id` | Update template | ✅ |
| `DELETE` | `/:id` | Delete template (soft) | ✅ |
| `PATCH` | `/:id/favorite` | Toggle favorite status | ✅ |

#### 📤 Uploads (`/api/upload`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/` | Upload file attachment | ✅ |
| `DELETE` | `/:filename` | Delete uploaded file | ✅ |

#### 🤖 AI (`/api/ai`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/generate-template` | Generate email with AI | ✅ |

### Request/Response Examples

#### Create Campaign
```bash
POST /api/campaigns
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Summer Sale Campaign",
  "subject": "Special Summer Offer for {name}",
  "body": "<p>Hi {name},</p><p>Check out our summer deals!</p>",
  "recipients": [1, 2, 3],  // Contact IDs
  "scheduled_at": "2024-07-01T10:00:00Z"
}
```

#### Upload CSV Contacts
```bash
POST /api/contacts/upload-csv
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: contacts.csv
```

CSV Format:
```csv
name,email,company,designation
John Doe,john@example.com,Acme Inc,CEO
Jane Smith,jane@example.com,Tech Corp,CTO
```

### Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Server Error

---

## 🛡️ Security Features

### Authentication & Authorization
- **Google OAuth 2.0** - Industry-standard secure authentication
- **JWT Tokens** - Stateless session management with expiration
- **Refresh Tokens** - Encrypted storage of Google refresh tokens
- **Protected Routes** - Client and server-side route protection

### Data Security
- **Parameterized Queries** - Protection against SQL injection
- **Input Sanitization** - XSS prevention on all inputs
- **CORS Configuration** - Restricted cross-origin requests
- **Helmet.js** - Security headers (CSP, HSTS, etc.)

### Rate Limiting
- **API Rate Limiting** - Prevents abuse and DDoS attacks
- **Per-endpoint limits** - Custom limits for sensitive endpoints
- **IP-based tracking** - Rate limits per IP address

### File Upload Security
- **File Type Validation** - Only allowed file types
- **File Size Limits** - Maximum 10MB per file
- **User-isolated Storage** - Files stored in user-specific folders
- **Secure Filenames** - Sanitized and unique filenames

### Privacy
- **Soft Delete** - Data marked as inactive, not permanently deleted
- **User Data Isolation** - Users can only access their own data
- **No Password Storage** - All auth handled via Google OAuth
- **Minimal Data Collection** - Only necessary data collected

---

## � Available Scripts

### Frontend
- React 19 + Vite
- Tailwind CSS v4
- Radix UI Components
- React Router v7
- GSAP Animations
- Recharts
- Axios

### Backend
- Node.js + Express
- PostgreSQL + pg
- JWT Authentication
- Gmail API (googleapis)
- Multer (file uploads)
- Winston (logging)

## 📜 Scripts

### Root Directory
```bash
npm run dev           # Run client and server concurrently
npm run dev:client    # Run client only (port 5173)
npm run dev:server    # Run server only (port 5000)
npm run install:all   # Install all dependencies
```

### Client Directory
```bash
npm run dev           # Start Vite dev server
npm run build         # Production build to /dist
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

### Server Directory
```bash
npm start             # Production mode
npm run dev           # Development with nodemon
```

---

## 🚀 Deployment

See detailed deployment instructions in the project documentation.

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Jay Joshi** - [@jayjoshi2512](https://github.com/jayjoshi2512)

---

<div align="center">
  <h3>⭐ Star this repo if you find it helpful!</h3>
  <p>Made with ❤️ by Jay Joshi</p>
</div>
