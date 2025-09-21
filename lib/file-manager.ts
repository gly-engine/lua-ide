"use client"

export interface SaveOptions {
  location: "localStorage" | "device"
  filename?: string
}

export interface LoadOptions {
  source: "localStorage" | "file" | "url"
  file?: File
  url?: string
}

export class FileManager {
  private static readonly STORAGE_KEY = "lua-ide-code"
  private static readonly FILENAME_KEY = "lua-ide-filename"

  // Save functionality
  static async save(code: string, options: SaveOptions): Promise<{ success: boolean; error?: string }> {
    try {
      if (options.location === "localStorage") {
        localStorage.setItem(this.STORAGE_KEY, code)
        if (options.filename) {
          localStorage.setItem(this.FILENAME_KEY, options.filename)
        }
        return { success: true }
      } else if (options.location === "device") {
        const filename = options.filename || "codigo.lua"
        const blob = new Blob([code], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true }
      }

      return { success: false, error: "Opção de salvamento inválida" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }

  // Load functionality
  static async load(
    options: LoadOptions,
  ): Promise<{ success: boolean; code?: string; filename?: string; error?: string }> {
    try {
      if (options.source === "localStorage") {
        const code = localStorage.getItem(this.STORAGE_KEY)
        const filename = localStorage.getItem(this.FILENAME_KEY)
        if (code) {
          return { success: true, code, filename: filename || undefined }
        }
        return { success: false, error: "Nenhum código salvo encontrado" }
      } else if (options.source === "file" && options.file) {
        const text = await options.file.text()
        return { success: true, code: text, filename: options.file.name }
      } else if (options.source === "url" && options.url) {
        const response = await fetch(options.url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const code = await response.text()
        return { success: true, code }
      }

      return { success: false, error: "Opção de carregamento inválida" }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }
    }
  }

  // Share functionality - create shareable URL with base64 encoded code
  static createShareableUrl(code: string): string {
    try {
      const compressed = btoa(encodeURIComponent(code))
      const baseUrl = window.location.origin + window.location.pathname
      return `${baseUrl}?code=${compressed}`
    } catch (error) {
      throw new Error("Erro ao criar URL compartilhável")
    }
  }

  // Load code from URL parameter
  static loadFromUrl(): string | null {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const codeParam = urlParams.get("code")
      if (codeParam) {
        return decodeURIComponent(atob(codeParam))
      }
      return null
    } catch (error) {
      console.error("Erro ao carregar código da URL:", error)
      return null
    }
  }

  // Get auto-saved code
  static getAutoSavedCode(): string | null {
    return localStorage.getItem(this.STORAGE_KEY)
  }

  // Clear auto-saved code
  static clearAutoSavedCode(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.FILENAME_KEY)
  }
}
