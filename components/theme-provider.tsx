"use client"

import * as React from "react"

export type Theme = 
  | "nature" 
  | "glassmorphism" 
  | "neo-brutalism" 
  | "cinematic" 
  | "data-driven" 
  | "luxury"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "nature",
  setTheme: () => null,
}

const ThemeContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "nature",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  React.useEffect(() => {
    const root = window.document.documentElement
    
    // Remove previous theme attributes if any (though we are replacing the value)
    root.classList.remove("light", "dark")
    
    // Set the data-theme attribute
    root.setAttribute("data-theme", theme)

    // Optional: Add class for tailwind dark mode if needed (assuming cinematic/luxury might be dark)
    if (theme === "cinematic" || theme === "luxury" || theme === "glassmorphism") {
      root.classList.add("dark")
    } else {
      root.classList.add("light")
    }

    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={value} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
