"use client"

export interface IDESettings {
  theme: "light" | "dark" | "system"
  editorTheme: string
  language: "pt" | "en" | "es"
  autoSave: boolean
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: "on" | "off"
}

export const DEFAULT_SETTINGS: IDESettings = {
  theme: "system",
  editorTheme: "vs-dark",
  language: "en", // Default to English
  autoSave: false,
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  lineNumbers: "on",
}

export const EDITOR_THEMES = [
  { value: "vs", label: "Visual Studio Light" },
  { value: "vs-dark", label: "Visual Studio Dark" },
  { value: "hc-black", label: "High Contrast Dark" },
  { value: "hc-light", label: "High Contrast Light" },
]

export class SettingsManager {
  private static readonly STORAGE_KEY = "lua-ide-settings"

  static getSettings(): IDESettings {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_SETTINGS, ...parsed }
      }

      // If no settings are stored, detect language
      const browserLang = navigator.language.split("-")[0] as IDESettings["language"];
      if (["en", "pt", "es"].includes(browserLang)) {
        const settings = { ...DEFAULT_SETTINGS, language: browserLang };
        this.saveSettings(settings);
        return settings;
      }

    } catch (error) {
      console.error("Error loading settings:", error)
    }

    return DEFAULT_SETTINGS
  }

  static saveSettings(settings: IDESettings): void {
    if (typeof window === "undefined") {
      return
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }

  static updateSetting<K extends keyof IDESettings>(key: K, value: IDESettings[K]): IDESettings {
    const settings = this.getSettings()
    const updated = { ...settings, [key]: value }
    this.saveSettings(updated)
    return updated
  }

  static resetSettings(): IDESettings {
    this.saveSettings(DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  }
}
