"use client"

export interface TranslationFile {
  id: string
  name: string
  language: string
  translations: Record<string, string>
  createdAt: Date
  isDefault?: boolean
}

export interface POEntry {
  msgid: string
  msgstr: string
  context?: string
  comment?: string
}

export class ExternalI18nManager {
  private static readonly STORAGE_KEY = "gly-ide-translation-files"
  private static readonly CURRENT_LANGUAGE_KEY = "gly-ide-current-language"

  static parsePOFile(content: string): Record<string, string> {
    const translations: Record<string, string> = {}
    const lines = content.split("\n")
    let currentEntry: Partial<POEntry> = {}
    let inMsgid = false
    let inMsgstr = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (line.startsWith("msgid ")) {
        if (currentEntry.msgid && currentEntry.msgstr) {
          translations[currentEntry.msgid] = currentEntry.msgstr
        }
        currentEntry = { msgid: line.substring(7, line.length - 1) }
        inMsgid = true
        inMsgstr = false
      } else if (line.startsWith("msgstr ")) {
        currentEntry.msgstr = line.substring(8, line.length - 1)
        inMsgid = false
        inMsgstr = true
      } else if (line.startsWith('"') && line.endsWith('"')) {
        const content = line.substring(1, line.length - 1)
        if (inMsgid && currentEntry.msgid !== undefined) {
          currentEntry.msgid += content
        } else if (inMsgstr && currentEntry.msgstr !== undefined) {
          currentEntry.msgstr += content
        }
      } else if (line === "") {
        if (currentEntry.msgid && currentEntry.msgstr) {
          translations[currentEntry.msgid] = currentEntry.msgstr
        }
        currentEntry = {}
        inMsgid = false
        inMsgstr = false
      }
    }

    // Add the last entry
    if (currentEntry.msgid && currentEntry.msgstr) {
      translations[currentEntry.msgid] = currentEntry.msgstr
    }

    return translations
  }

  static parseCSVFile(content: string): Record<string, string> {
    const translations: Record<string, string> = {}
    const lines = content.split("\n")

    for (let i = 1; i < lines.length; i++) {
      // Skip header
      const line = lines[i].trim()
      if (!line) continue

      const [key, value] = line.split(",").map((cell) => cell.replace(/^"/, "").replace(/"$/, "").replace(/""/g, '"'))

      if (key && value) {
        translations[key] = value
      }
    }

    return translations
  }

  static parseJSONFile(content: string): Record<string, string> {
    try {
      return JSON.parse(content)
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  static async loadTranslationFile(
    file: File,
  ): Promise<{ success: boolean; translations?: Record<string, string>; error?: string }> {
    try {
      const content = await file.text()
      const extension = file.name.split(".").pop()?.toLowerCase()
      let translations: Record<string, string>

      switch (extension) {
        case "po":
          translations = this.parsePOFile(content)
          break
        case "csv":
          translations = this.parseCSVFile(content)
          break
        case "json":
          translations = this.parseJSONFile(content)
          break
        default:
          return { success: false, error: "Formato de arquivo não suportado. Use .po, .csv ou .json" }
      }

      return { success: true, translations }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao processar arquivo",
      }
    }
  }

  static saveTranslationFile(translationFile: TranslationFile): boolean {
    try {
      const files = this.getTranslationFiles()
      const updatedFiles = files.filter((f) => f.id !== translationFile.id)
      updatedFiles.push(translationFile)

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles))
      return true
    } catch {
      return false
    }
  }

  static getTranslationFiles(): TranslationFile[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return []

      return JSON.parse(saved).map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt),
      }))
    } catch {
      return []
    }
  }

  static deleteTranslationFile(fileId: string): boolean {
    try {
      const files = this.getTranslationFiles()
      const updatedFiles = files.filter((f) => f.id !== fileId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles))
      return true
    } catch {
      return false
    }
  }

  static setCurrentLanguage(languageId: string): void {
    localStorage.setItem(this.CURRENT_LANGUAGE_KEY, languageId)
  }

  static getCurrentLanguage(): string {
    return localStorage.getItem(this.CURRENT_LANGUAGE_KEY) || "pt"
  }

  static getCurrentTranslations(): Record<string, string> {
    const currentLang = this.getCurrentLanguage()
    const files = this.getTranslationFiles()
    const currentFile = files.find((f) => f.language === currentLang)

    return currentFile?.translations || {}
  }

  static exportToPO(translations: Record<string, string>): string {
    let content = "# Translation file generated by Gly Engine Lua IDE\n"
    content += "# \n"
    content += 'msgid ""\n'
    content += 'msgstr ""\n'
    content += '"Content-Type: text/plain; charset=UTF-8\\n"\n\n'

    for (const [key, value] of Object.entries(translations)) {
      content += `msgid "${key}"\n`
      content += `msgstr "${value}"\n\n`
    }

    return content
  }

  static exportToCSV(translations: Record<string, string>): string {
    let content = "key,translation\n"

    for (const [key, value] of Object.entries(translations)) {
      const escapedKey = `"${key.replace(/"/g, '""')}"`
      const escapedValue = `"${value.replace(/"/g, '""')}"`
      content += `${escapedKey},${escapedValue}\n`
    }

    return content
  }

  static createTemplate(baseTranslations: Record<string, string>): Record<string, string> {
    const template: Record<string, string> = {}

    for (const key of Object.keys(baseTranslations)) {
      template[key] = "" // Empty values for translation
    }

    return template
  }
}
