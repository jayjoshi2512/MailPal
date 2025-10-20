# MailKar Client

Frontend client for MailKar - Email Campaign Management SaaS Platform

## 🚀 Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router v7** - Routing
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible UI components
- **Lucide React** - Icons
- **GSAP** - Animations
- **Motion** - Advanced animations

## 📁 Project Structure

```
client/
├── public/              # Static assets
│   ├── Fonts/
│   └── Images/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/         # UI components (button, card, etc.)
│   │   ├── Compose/    # Email composition components
│   │   └── Landing/    # Landing page components
│   ├── context/        # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/          # Page components
│   │   ├── AuthCallback.jsx
│   │   ├── Compose.jsx
│   │   ├── ConnectGoogle.jsx
│   │   ├── Dashboard.jsx
│   │   └── LandingPage.jsx
│   ├── routes/         # Route configuration
│   │   └── Routes.jsx
│   ├── App.jsx         # Root component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── components.json     # shadcn/ui config
├── eslint.config.js    # ESLint configuration
├── index.html          # HTML template
├── jsconfig.json       # JavaScript config
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── vite.config.js      # Vite configuration
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Environment Configuration

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Development Server

```bash
npm run dev
```

The client will start on `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

### 5. Preview Production Build

```bash
npm run preview
```

## 🎨 UI Components

Built with Radix UI and Tailwind CSS for accessibility and customization:

- **Button** - Various variants and sizes
- **Card** - Content containers
- **Input** - Form inputs
- **Textarea** - Multi-line text input
- **Checkbox** - Selection control
- **Dropdown Menu** - Context menus
- **Badge** - Status indicators
- **Separator** - Visual dividers

## 📱 Pages

### Landing Page
- Hero section with animations
- Feature showcase
- Call-to-action

### Dashboard
- Campaign overview
- Analytics widgets
- Quick actions

### Compose Email
- Rich text editor
- Recipient management
- Attachment handling
- Email scheduling

### Connect Google
- OAuth integration
- Permission management

## 🔐 Authentication Flow

1. User clicks "Connect Google"
2. Redirected to backend OAuth endpoint
3. After Google authorization, redirected back to `/auth/callback`
4. JWT token saved in localStorage
5. Protected routes check for valid token

## 🌐 API Integration

All API calls should go through the backend server (`http://localhost:5000/api`).

Example:

```javascript
const response = await fetch('http://localhost:5000/api/campaigns', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## 🎨 Styling

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the Vite plugin.

### Theme Configuration

Dark mode is supported via `theme-provider.tsx`.

### Custom Animations

- GSAP for timeline-based animations
- Motion for gesture-based interactions
- CSS animations via `tw-animate-css`

## 🧩 Component Library

Using shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

## 📦 Build Output

```bash
npm run build
```

Output directory: `dist/`

Optimized for production with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization

## 🚀 Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

### Netlify

```bash
netlify deploy --prod
```

### Manual

1. Build: `npm run build`
2. Upload `dist/` folder to your hosting
3. Configure server to serve `index.html` for all routes (SPA mode)

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🧪 Testing

(Coming soon)

```bash
npm test
```

## 🤝 Contributing

(Add your contribution guidelines here)

## 📄 License

(Add your license here)
