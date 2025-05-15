import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark")
  }
  
  return (
    <button
      type="button"
      role="switch"
      aria-checked={theme === "dark"}
      onClick={toggleTheme}
      className={`
        relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 
        border-transparent transition-colors duration-200 ease-in-out focus:outline-none
        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${theme === "dark" ? 'bg-indigo-600' : 'bg-gray-200'}
      `}
    >
      <span className="sr-only">
        {theme === "dark" ? 'Switch to light mode' : 'Switch to dark mode'}
      </span>
      <span
        className={`
          pointer-events-none relative inline-block h-5 w-5 transform rounded-full
          bg-white shadow ring-0 transition duration-200 ease-in-out
          ${theme === "dark" ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {theme === "dark" ? (
          <span className="absolute inset-0 flex h-full w-full items-center justify-center text-indigo-600">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
              <path d="M5.2 6.2C5.2 4.1 6.6 2.1 8.5 1.3 8.1 1.1 7.7 1 7.3 1 4.9 1 3 3.2 3 6 3 8.8 4.9 11 7.3 11c.4 0 .8-.1 1.2-.3C6.6 9.9 5.2 7.9 5.2 6.2z"/>
            </svg>
          </span>
        ) : (
          <span className="absolute inset-0 flex h-full w-full items-center justify-center text-amber-500">
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 12 12">
              <path d="M6 1.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V2a.5.5 0 0 1 .5-.5zm0 8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm4.95-5.55a.5.5 0 0 1 0 .7l-.7.7a.5.5 0 0 1-.7-.7l.7-.7a.5.5 0 0 1 .7 0zm-8.6 6.3a.5.5 0 0 1 0 .7l-.7.7a.5.5 0 1 1-.7-.7l.7-.7a.5.5 0 0 1 .7 0zM1.5 6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1H2a.5.5 0 0 1-.5-.5zm8 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm-8.6-4.5a.5.5 0 0 1 .7 0l.7.7a.5.5 0 0 1-.7.7l-.7-.7a.5.5 0 0 1 0-.7zm8.6 0a.5.5 0 0 1 0 .7l-.7.7a.5.5 0 1 1-.7-.7l.7-.7a.5.5 0 0 1 .7 0zM6 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
          </span>
        )}
      </span>
    </button>
  )
}
