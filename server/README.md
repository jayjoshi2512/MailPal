# MailKar Server

Backend server for MailKar - Email Campaign Management SaaS Platform

## 🚀 Tech Stack

- **Node.js** & **Express.js** - Server framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Google OAuth 2.0** - User authentication
- **Gmail API** - Email sending

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # PostgreSQL connection pool
│   │   ├── index.js      # Environment config
│   │   └── logger.js     # Winston logger setup
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── campaignController.js
│   │   └── contactController.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT authentication
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validator.js
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── campaignRoutes.js
│   │   ├── contactRoutes.js
│   │   └── index.js
│   ├── services/         # Business logic (coming soon)
│   ├── utils/            # Utility functions (coming soon)
│   └── server.js         # Entry point
├── logs/                 # Application logs
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Google Cloud Project with OAuth 2.0 credentials

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mailkar
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

# Server
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Database Setup

1. Create the database (if not already done):
   ```sql
   CREATE DATABASE mailkar;
   ```

2. Run SQL files from the `../db/` folder in order:
   ```bash
   psql -U postgres -d mailkar -f ../db/01_users.sql
   psql -U postgres -d mailkar -f ../db/02_campaigns.sql
   # ... and so on
   ```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API and Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/auth/callback` (for frontend)
6. Copy Client ID and Client Secret to `.env`

### 5. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Authentication

- **GET** `/auth/google` - Get Google OAuth URL
- **GET** `/auth/google/callback` - OAuth callback handler
- **GET** `/auth/me` - Get current user (requires JWT)
- **POST** `/auth/logout` - Logout user
- **POST** `/auth/refresh` - Refresh access token

#### Campaigns

- **GET** `/campaigns` - Get all campaigns
- **GET** `/campaigns/:id` - Get campaign by ID
- **POST** `/campaigns` - Create new campaign
- **PATCH** `/campaigns/:id` - Update campaign
- **DELETE** `/campaigns/:id` - Delete campaign
- **GET** `/campaigns/:id/analytics` - Get campaign analytics

#### Contacts

- **GET** `/campaigns/:campaignId/contacts` - Get all contacts
- **POST** `/campaigns/:campaignId/contacts` - Add single contact
- **POST** `/campaigns/:campaignId/contacts/bulk` - Bulk add contacts
- **PATCH** `/campaigns/:campaignId/contacts/:contactId` - Update contact
- **DELETE** `/campaigns/:campaignId/contacts/:contactId` - Delete contact

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Example Requests

#### Create Campaign
```bash
POST /api/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Launch Campaign",
  "subject": "Exciting News from {{company}}",
  "body": "Hi {{firstName}},\n\nWe're launching something amazing...",
  "daily_limit": 50,
  "delay_min": 5,
  "delay_max": 15
}
```

#### Bulk Add Contacts
```bash
POST /api/campaigns/1/contacts/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "contacts": [
    {
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company": "Acme Corp"
    },
    {
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "company": "TechCo"
    }
  ]
}
```

## 🔒 Security Features

- **Helmet.js** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevent abuse
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Express-validator
- **SQL Injection Prevention** - Parameterized queries
- **Error Handling** - Comprehensive error middleware

## 📊 Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error logs only
- `combined.log` - All logs

Winston logger with different log levels:
- `error` - Critical errors
- `warn` - Warnings
- `info` - General information
- `debug` - Debugging information

## 🧪 Testing

(Coming soon)

```bash
npm test
```

## 🚀 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name mailkar-api
   ```
3. Set up reverse proxy (Nginx/Apache)
4. Enable SSL/TLS certificates
5. Configure firewall rules
6. Set up database backups
7. Monitor with logging service

## 📝 Best Practices Implemented

- ✅ Modular route structure
- ✅ Controller-based architecture
- ✅ Middleware for reusable logic
- ✅ Environment-based configuration
- ✅ Connection pooling for database
- ✅ Proper error handling
- ✅ Input validation
- ✅ Security middleware
- ✅ Logging and monitoring
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Transaction support
- ✅ Async/await pattern
- ✅ ES6 modules

## 🔧 Future Enhancements

- [ ] Email queue processing service
- [ ] Background job scheduler (node-cron)
- [ ] Email template rendering
- [ ] Analytics dashboard API
- [ ] Webhook support
- [ ] Real-time notifications (Socket.io)
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🤝 Contributing

(Add your contribution guidelines here)

## 📄 License

(Add your license here)
