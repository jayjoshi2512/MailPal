// import { Moon, SunMedium } from "lucide-react"
import { Button } from "@/components/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme} className='cursor-pointer relative overflow-hidden'>
            <i className="ri-moon-fill size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90 text-xl"></i>
            {/* <Moon className="size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" /> */}
            <i className="ri-sun-fill size-6 absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0 text-xl"></i>
            {/* <SunMedium className="size-6 absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" /> */}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}