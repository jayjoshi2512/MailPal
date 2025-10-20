import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Toaster, toast } from 'sonner'
import 'remixicon/fonts/remixicon.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <App />
            <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
    </StrictMode>,
)
