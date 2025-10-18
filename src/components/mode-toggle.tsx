// import { Moon, SunMedium } from "lucide-react"
import { Button } from "@/components/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <button
            onClick={toggleTheme} className='cursor-pointer relative overflow-hidden'>

            <i className={`${theme=="light" ? "ri-moon-fill" : "ri-sun-fill"} text-light  size-6 scale-100 rotate-100 transition-all duration-300 dark:scale-0 dark:-rotate-90 text-xl`}></i>

            <span className="sr-only">Toggle theme</span>
        </button>
    )
}