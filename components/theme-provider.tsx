"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { SettingsManager, type IDESettings } from "@/lib/settings"

type Theme = "light" | "dark" | "system"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
  settings: IDESettings
  updateSettings: (settings: IDESettings) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<IDESettings>(SettingsManager.getSettings())
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("light")

  const setTheme = (theme: Theme) => {
    const updated = SettingsManager.updateSetting("theme", theme)
    setSettings(updated)
  }

  const updateSettings = (newSettings: IDESettings) => {
    setSettings(newSettings)
  }

  useEffect(() => {
    const { theme } = settings

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setActualTheme(systemTheme)
      document.documentElement.className = systemTheme
    } else {
      setActualTheme(theme)
      document.documentElement.className = theme
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        const systemTheme = mediaQuery.matches ? "dark" : "light"
        setActualTheme(systemTheme)
        document.documentElement.className = systemTheme
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [settings]) // Updated to use the entire settings object as a dependency

  return (
    <ThemeContext.Provider value={{ theme: settings.theme, setTheme, actualTheme, settings, updateSettings }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
