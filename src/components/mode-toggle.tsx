import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light")
    }

    return (
        <button
            onClick={toggleTheme} className='cursor-pointer relative overflow-hidden'>

            <i className={`${theme=="light" ? "ri-moon-fill" : "ri-sun-fill"} text-light items-center justify-center size-6 scale-100 rotate-100 transition-all duration-300 dark:scale-0 dark:-rotate-90 text-2xl`}></i>

            <span className="sr-only">Toggle theme</span>
        </button>
    )
}