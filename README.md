# MailKar - Email Campaign Management Platform

A production-ready SaaS application for managing cold email campaigns with Gmail integration, built with React and Node.js.

## 🌟 Features

- 📧 **Gmail Integration** - Send emails through your Gmail account via OAuth 2.0
- 📊 **Campaign Management** - Create and manage multiple email campaigns
- 👥 **Contact Management** - Import, organize, and segment contacts
- 📈 **Analytics** - Track opens, clicks, and replies
- ⏱️ **Email Scheduling** - Queue emails with smart delays
- 🎯 **Personalization** - Dynamic email templates with variables
- 🔄 **Follow-up Sequences** - Automated multi-step email sequences
- 🔒 **Secure Authentication** - Google OAuth 2.0 with JWT
- 🎨 **Modern UI** - Beautiful, responsive interface with dark mode

## 🏗️ Architecture

```
MailKar/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── routes/        # Route configuration
│   └── package.json
│
├── server/                # Node.js/Express backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   └── package.json
│
├── db/                    # PostgreSQL database schema
│   ├── 01_users.sql
│   ├── 02_campaigns.sql
│   ├── 03_contacts.sql
│   └── ... (more tables)
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **Google Cloud Project** with OAuth 2.0 credentials
- **Gmail API** enabled

### 1. Clone the Repository

```bash
git clone https://github.com/jayjoshi2512/Cold-Mailer.git
cd Cold-Mailer
```

### 2. Database Setup

#### Create Database

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

#### Run SQL Files

Execute SQL files in the `db/` folder in order:

```bash
psql -U postgres -d mailkar -f db/01_users.sql
psql -U postgres -d mailkar -f db/02_campaigns.sql
psql -U postgres -d mailkar -f db/03_contacts.sql
psql -U postgres -d mailkar -f db/04_sequences.sql
psql -U postgres -d mailkar -f db/05_sent_emails.sql
psql -U postgres -d mailkar -f db/06_email_queue.sql
psql -U postgres -d mailkar -f db/07_click_tracking.sql
psql -U postgres -d mailkar -f db/08_templates.sql
psql -U postgres -d mailkar -f db/09_views.sql
```

Or using pgAdmin:
1. Open pgAdmin
2. Right-click on `mailkar` database → Query Tool
3. Open each `.sql` file and execute

### 3. Server Setup

```bash
cd server
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

Required environment variables in `server/.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mailkar
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key_change_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Server
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 4. Client Setup

```bash
cd ../client
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Gmail API** and **Google+ API**
4. Create **OAuth 2.0 credentials**
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth/callback`
6. Copy Client ID and Client Secret to `server/.env`

### 6. Run the Application

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
Server runs on `http://localhost:5000`

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
Client runs on `http://localhost:5173`

## 📚 Documentation

### Database Schema

See `db/README.md` for detailed database schema documentation.

**Tables:**
- `users` - User accounts and OAuth tokens
- `campaigns` - Email campaigns
- `contacts` - Campaign recipients
- `sequences` - Multi-step email sequences
- `sent_emails` - Email delivery tracking
- `email_queue` - Scheduled emails
- `click_tracking` - Link click analytics
- `templates` - Reusable email templates

### API Documentation

See `server/README.md` for complete API documentation.

**Base URL:** `http://localhost:5000/api`

**Main Endpoints:**
- `/auth/*` - Authentication (OAuth, JWT)
- `/campaigns` - Campaign management
- `/campaigns/:id/contacts` - Contact management
- `/campaigns/:id/analytics` - Campaign analytics

### Frontend Documentation

See `client/README.md` for frontend documentation.

**Key Features:**
- React 19 with hooks
- Vite for fast development
- Tailwind CSS v4 for styling
- Radix UI for accessible components
- React Router v7 for routing

## 🔒 Security Features

- ✅ **Helmet.js** - HTTP security headers
- ✅ **CORS** - Configured cross-origin requests
- ✅ **Rate Limiting** - Prevent API abuse
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Input Validation** - Server-side validation
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **Password Hashing** - Bcrypt for passwords
- ✅ **Environment Variables** - Sensitive data protection

## 🎯 Production Deployment

### Backend (Server)

1. Set `NODE_ENV=production`
2. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name mailkar-api
   ```
3. Set up reverse proxy (Nginx)
4. Enable SSL/TLS certificates
5. Configure firewall

### Frontend (Client)

1. Build production bundle:
   ```bash
   cd client
   npm run build
   ```
2. Deploy to:
   - **Vercel** (recommended)
   - **Netlify**
   - **AWS S3 + CloudFront**
   - Any static hosting

### Database

1. Use managed PostgreSQL (AWS RDS, DigitalOcean, etc.)
2. Enable SSL connections
3. Set up automated backups
4. Configure connection pooling
5. Monitor query performance

## 🛠️ Development Tools

### Server Scripts

```bash
npm run dev      # Development with nodemon
npm start        # Production mode
```

### Client Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📊 Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS v4
- React Router v7
- Radix UI
- GSAP
- Lucide Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- Google OAuth 2.0
- Gmail API
- Winston (logging)
- Helmet (security)
- Express Validator

## 🧪 Testing

(Coming soon)

```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

## 📈 Roadmap

- [ ] Email template builder
- [ ] A/B testing
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Webhook integrations
- [ ] API rate limiting per user
- [ ] Email warmup functionality
- [ ] Bounce handling
- [ ] Unsubscribe management
- [ ] SMTP support (beyond Gmail)
- [ ] Mobile app

## 🐛 Known Issues

- Email queue processor not yet implemented
- Background jobs need cron setup
- Analytics dashboard UI pending

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Jay Joshi**
- GitHub: [@jayjoshi2512](https://github.com/jayjoshi2512)

## 🙏 Acknowledgments

- React team for React 19
- Vercel for Vite
- Tailwind Labs for Tailwind CSS
- Radix UI for accessible components
- PostgreSQL community

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**⭐ Star this repository if you find it helpful!**
