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
  keyboard: {
    enabled: boolean
    hapticFeedback: boolean
    layout: "ansi" | "compact"
    theme: string
  }
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
  keyboard: {
    enabled: true,
    hapticFeedback: true,
    layout: "compact",
    theme: "hg-theme-default",
  },
}

export const EDITOR_THEMES = [
  { value: "vs", label: "Visual Studio Light" },
  { value: "vs-dark", label: "Visual Studio Dark" },
  { value: "hc-black", label: "High Contrast Dark" },
  { value: "hc-light", label: "High Contrast Light" },
  { value: "active4d", label: "Active4D" },
  { value: "all-hallows-eve", label: "All Hallows Eve" },
  { value: "amy", label: "Amy" },
  { value: "birds-of-paradise", label: "Birds of Paradise" },
  { value: "blackboard", label: "Blackboard" },
  { value: "brilliance-black", label: "Brilliance Black" },
  { value: "brilliance-dull", label: "Brilliance Dull" },
  { value: "chrome-devtools", label: "Chrome DevTools" },
  { value: "clouds-midnight", label: "Clouds Midnight" },
  { value: "clouds", label: "Clouds" },
  { value: "cobalt", label: "Cobalt" },
  { value: "cobalt2", label: "Cobalt2" },
  { value: "dawn", label: "Dawn" },
  { value: "dominion-day", label: "Dominion Day" },
  { value: "dracula", label: "Dracula" },
  { value: "dreamweaver", label: "Dreamweaver" },
  { value: "eiffel", label: "Eiffel" },
  { value: "espresso-libre", label: "Espresso Libre" },
  { value: "github", label: "GitHub" },
  { value: "idle", label: "IDLE" },
  { value: "idle-fingers", label: "idleFingers" },
  { value: "iplastic", label: "iPlastic" },
  { value: "katzenmilch", label: "Katzenmilch" },
  { value: "kr-theme", label: "KrTheme" },
  { value: "kuroir", label: "Kuroir" },
  { value: "lazy", label: "LAZY" },
  { value: "magic-wb", label: "MagicWB (Amiga)" },
  { value: "merbivore-soft", label: "Merbivore Soft" },
  { value: "merbivore", label: "Merbivore" },
  { value: "monoindustrial", label: "monoindustrial" },
  { value: "monokai", label: "Monokai" },
  { value: "monokai-bright", label: "Monokai Bright" },
  { value: "night-owl", label: "Night Owl" },
  { value: "nord", label: "Nord" },
  { value: "oceanic-next", label: "Oceanic Next" },
  { value: "pastels-on-dark", label: "Pastels on Dark" },
  { value: "slush-and-poppies", label: "Slush and Poppies" },
  { value: "solarized-dark", label: "Solarized-dark" },
  { value: "solarized-light", label: "Solarized-light" },
  { value: "space-cadet", label: "SpaceCadet" },
  { value: "sunburst", label: "Sunburst" },
  { value: "textmate", label: "Textmate (Mac Classic)" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "tomorrow-night", label: "Tomorrow-Night" },
  { value: "tomorrow-night-blue", label: "Tomorrow-Night-Blue" },
  { value: "tomorrow-night-bright", label: "Tomorrow-Night-Bright" },
  { value: "tomorrow-night-eighties", label: "Tomorrow-Night-Eighties" },
  { value: "twilight", label: "Twilight" },
  { value: "upstream-sunburst", label: "Upstream Sunburst" },
  { value: "vibrant-ink", label: "Vibrant Ink" },
  { value: "xcode", label: "Xcode_default" },
  { value: "zenburnesque", label: "Zenburnesque" },
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
