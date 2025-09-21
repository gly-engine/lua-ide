"use client"

export interface SavedFile {
  id: string
  name: string
  code: string
  createdAt: Date
  updatedAt: Date
  isAutoSave?: boolean
  luaVersion?: string
  libraries?: string[]
}

export interface SaveOptions {
  location: "localStorage" | "device"
  filename?: string
  isAutoSave?: boolean
}

export interface LoadOptions {
  source: "localStorage" | "file" | "url" | "savedFile"
  file?: File
  url?: string
  savedFileId?: string
}

export class EnhancedFileManager {
  private static readonly STORAGE_KEY = "gly-ide-saved-files"
  private static readonly CURRENT_FILE_KEY = "gly-ide-current-file"
  private static readonly AUTO_SAVE_KEY = "gly-ide-auto-save"
  private static readonly LAST_SAVE_TIME_KEY = "gly-ide-last-save-time"

  static async save(
    code: string,
    options: SaveOptions,
  ): Promise<{ success: boolean; error?: string; fileId?: string }> {
    try {
      if (options.location === "localStorage") {
        const savedFiles = this.getSavedFiles()
        const now = new Date()

        let fileId: string
        let fileName: string

        if (options.isAutoSave) {
          // Auto-save always uses the same ID and name
          fileId = "auto-save"
          fileName = "Salvamento Automático"
        } else {
          fileId = Date.now().toString()
          fileName = options.filename || `Arquivo ${savedFiles.length + 1}`
        }

        const savedFile: SavedFile = {
          id: fileId,
          name: fileName,
          code,
          createdAt: options.isAutoSave ? savedFiles.find((f) => f.id === "auto-save")?.createdAt || now : now,
          updatedAt: now,
          isAutoSave: options.isAutoSave,
          luaVersion: "5.4",
          libraries: this.extractLibraries(code),
        }

        // Update or add the file
        const updatedFiles = savedFiles.filter((f) => f.id !== fileId)
        updatedFiles.push(savedFile)

        // Keep only the last 50 files (excluding auto-save)
        const regularFiles = updatedFiles.filter((f) => !f.isAutoSave).slice(-49)
        const autoSaveFile = updatedFiles.find((f) => f.isAutoSave)
        const finalFiles = autoSaveFile ? [autoSaveFile, ...regularFiles] : regularFiles

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(finalFiles))
        localStorage.setItem(this.CURRENT_FILE_KEY, fileId)
        localStorage.setItem(this.LAST_SAVE_TIME_KEY, now.toISOString())

        return { success: true, fileId }
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

  static async load(
    options: LoadOptions,
  ): Promise<{ success: boolean; code?: string; filename?: string; error?: string }> {
    try {
      if (options.source === "localStorage") {
        // Load the most recent file (auto-save or last saved)
        const savedFiles = this.getSavedFiles()
        if (savedFiles.length === 0) {
          return { success: false, error: "Nenhum arquivo salvo encontrado" }
        }

        const mostRecent = savedFiles.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0]
        return { success: true, code: mostRecent.code, filename: mostRecent.name }
      } else if (options.source === "savedFile" && options.savedFileId) {
        const savedFiles = this.getSavedFiles()
        const file = savedFiles.find((f) => f.id === options.savedFileId)
        if (!file) {
          return { success: false, error: "Arquivo não encontrado" }
        }
        localStorage.setItem(this.CURRENT_FILE_KEY, file.id)
        return { success: true, code: file.code, filename: file.name }
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

  static getSavedFiles(): SavedFile[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY)
      if (!saved) return []
      return JSON.parse(saved).map((file: any) => ({
        ...file,
        createdAt: new Date(file.createdAt),
        updatedAt: new Date(file.updatedAt),
      }))
    } catch {
      return []
    }
  }

  static deleteSavedFile(fileId: string): boolean {
    try {
      const savedFiles = this.getSavedFiles()
      const updatedFiles = savedFiles.filter((f) => f.id !== fileId)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles))
      return true
    } catch {
      return false
    }
  }

  static hasUnsavedChanges(currentCode: string): boolean {
    const lastSaveTime = localStorage.getItem(this.LAST_SAVE_TIME_KEY)
    if (!lastSaveTime) return currentCode.trim() !== ""

    const savedFiles = this.getSavedFiles()
    const currentFile = localStorage.getItem(this.CURRENT_FILE_KEY)

    if (currentFile) {
      const file = savedFiles.find((f) => f.id === currentFile)
      return file ? file.code !== currentCode : true
    }

    // Check against auto-save
    const autoSave = savedFiles.find((f) => f.isAutoSave)
    return autoSave ? autoSave.code !== currentCode : currentCode.trim() !== ""
  }

  static getTimeSinceLastSave(): number | null {
    const lastSaveTime = localStorage.getItem(this.LAST_SAVE_TIME_KEY)
    if (!lastSaveTime) return null
    return Date.now() - new Date(lastSaveTime).getTime()
  }

  static createShareableUrl(code: string): string {
    try {
      const compressed = btoa(encodeURIComponent(code))
      const baseUrl = window.location.origin + window.location.pathname
      return `${baseUrl}?code=${compressed}`
    } catch (error) {
      throw new Error("Erro ao criar URL compartilhável")
    }
  }

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

  static getAutoSavedCode(): string | null {
    const savedFiles = this.getSavedFiles()
    const autoSave = savedFiles.find((f) => f.isAutoSave)
    return autoSave?.code || null
  }

  static clearAutoSavedCode(): void {
    const savedFiles = this.getSavedFiles()
    const updatedFiles = savedFiles.filter((f) => !f.isAutoSave)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles))
  }

  static saveToLocalStorage(code: string, filename: string): void {
    const savedFiles = this.getSavedFiles()
    const now = new Date()
    const fileId = Date.now().toString()

    const savedFile: SavedFile = {
      id: fileId,
      name: filename,
      code,
      createdAt: now,
      updatedAt: now,
      luaVersion: "5.4",
      libraries: this.extractLibraries(code),
    }

    const updatedFiles = [...savedFiles, savedFile]
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFiles))
    localStorage.setItem(this.CURRENT_FILE_KEY, fileId)
    localStorage.setItem(this.LAST_SAVE_TIME_KEY, now.toISOString())
  }

  static loadFromLocalStorage(filename: string): string | null {
    const savedFiles = this.getSavedFiles()
    const file = savedFiles.find((f) => f.name === filename)
    if (file) {
      localStorage.setItem(this.CURRENT_FILE_KEY, file.id)
      return file.code
    }
    return null
  }

  static downloadFile(code: string, filename: string): void {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename.endsWith(".lua") ? filename : `${filename}.lua`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  static extractLibraries(code: string): string[] {
    const requirePattern = /require\s*$$\s*['"`]([^'"`]+)['"`]\s*$$/g
    const libraries: string[] = []
    let match

    while ((match = requirePattern.exec(code)) !== null) {
      libraries.push(match[1])
    }

    return [...new Set(libraries)] // Remove duplicates
  }

  static markAsSaved(): void {
    localStorage.setItem(this.LAST_SAVE_TIME_KEY, new Date().toISOString())
  }

  static clearAllData(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CURRENT_FILE_KEY)
    localStorage.removeItem(this.AUTO_SAVE_KEY)
    localStorage.removeItem(this.LAST_SAVE_TIME_KEY)
  }

  static getAvailableLibraries(): Array<{ name: string; description: string; github?: string; docs?: string }> {
    return [
      {
        name: "json",
        description: "Biblioteca para manipulação de JSON",
        docs: "https://www.lua.org/manual/5.4/manual.html#6.5",
      },
      {
        name: "socket",
        description: "Biblioteca para comunicação de rede",
        github: "https://github.com/diegonehab/luasocket",
        docs: "http://w3.impa.br/~diego/software/luasocket/",
      },
      {
        name: "lfs",
        description: "LuaFileSystem - manipulação de arquivos e diretórios",
        github: "https://github.com/keplerproject/luafilesystem",
        docs: "https://keplerproject.github.io/luafilesystem/",
      },
      {
        name: "lpeg",
        description: "Parsing Expression Grammars para Lua",
        github: "https://github.com/lua/lpeg",
        docs: "http://www.inf.puc-rio.br/~roberto/lpeg/",
      },
      {
        name: "cjson",
        description: "Fast JSON encoding/parsing",
        github: "https://github.com/mpx/lua-cjson",
        docs: "https://www.kyne.com.au/~mark/software/lua-cjson.php",
      },
      {
        name: "http",
        description: "Cliente HTTP para Lua",
        github: "https://github.com/daurnimator/lua-http",
        docs: "https://daurnimator.github.io/lua-http/",
      },
      {
        name: "uuid",
        description: "Geração de UUIDs",
        github: "https://github.com/Tieske/uuid",
        docs: "https://github.com/Tieske/uuid#readme",
      },
      {
        name: "inspect",
        description: "Pretty-printing de tabelas Lua",
        github: "https://github.com/kikito/inspect.lua",
        docs: "https://github.com/kikito/inspect.lua#readme",
      },
    ]
  }
}
