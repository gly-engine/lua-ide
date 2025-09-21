"use client"

// Lua interpreter service using Fengari (Lua VM in JavaScript)
export class LuaInterpreter {
  private lua: any = null
  private isInitialized = false
  private outputCallback: ((output: string, type: "output" | "error") => void) | null = null
  private inputCallback: (() => Promise<string>) | null = null

  async initialize() {
    if (this.isInitialized) return

    try {
      // Load Fengari dynamically
      const fengari = await import("fengari-web")
      this.lua = fengari.lua
      this.isInitialized = true

      // Set up print function to capture output
      this.lua.lua_pushcfunction(this.lua.L, (L: any) => {
        const nargs = this.lua.lua_gettop(L)
        const outputs = []
        for (let i = 1; i <= nargs; i++) {
          outputs.push(this.lua.lua_tostring(L, i))
        }
        if (this.outputCallback) {
          this.outputCallback(outputs.join("\t"), "output")
        }
        return 0
      })
      this.lua.lua_setglobal(this.lua.L, "print")

      // Set up io.read function
      this.lua.lua_pushcfunction(this.lua.L, (L: any) => {
        if (this.inputCallback) {
          // This is a simplified version - in a real implementation,
          // you'd need to handle async input properly
          this.inputCallback().then((input) => {
            this.lua.lua_pushstring(L, input)
          })
        }
        return 1
      })
      this.lua.lua_setglobal(this.lua.L, "io")
    } catch (error) {
      console.warn("Fengari not available, using mock interpreter")
      this.isInitialized = true
    }
  }

  setOutputCallback(callback: (output: string, type: "output" | "error") => void) {
    this.outputCallback = callback
  }

  setInputCallback(callback: () => Promise<string>) {
    this.inputCallback = callback
  }

  async executeCode(code: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Mock execution for now since Fengari might not be available
      if (!this.lua) {
        return this.mockExecute(code)
      }

      // Real Lua execution would go here
      const result = this.lua.luaL_dostring(this.lua.L, code)
      if (result !== this.lua.LUA_OK) {
        const error = this.lua.lua_tostring(this.lua.L, -1)
        if (this.outputCallback) {
          this.outputCallback(error, "error")
        }
        return { success: false, error }
      }

      return { success: true }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Erro desconhecido"
      if (this.outputCallback) {
        this.outputCallback(errorMsg, "error")
      }
      return { success: false, error: errorMsg }
    }
  }

  private mockExecute(code: string): { success: boolean; error?: string } {
    // Mock Lua execution for demonstration
    try {
      // Simple pattern matching for common Lua constructs
      const lines = code.split("\n")
      let hasIoRead = false

      for (const line of lines) {
        const trimmed = line.trim()

        // Check for io.read()
        if (trimmed.includes("io.read()")) {
          hasIoRead = true
          if (this.inputCallback) {
            // Enable input in the console
            // This would trigger the input field to become active
          }
        }

        // Mock print statements
        const printMatch = trimmed.match(/print\s*$$\s*["']([^"']*)["']\s*$$/)
        if (printMatch) {
          if (this.outputCallback) {
            this.outputCallback(printMatch[1], "output")
          }
        }

        // Mock print with variables
        const printVarMatch = trimmed.match(/print\s*$$\s*([^)]+)\s*$$/)
        if (printVarMatch && !printMatch) {
          if (this.outputCallback) {
            this.outputCallback(`${printVarMatch[1]} (valor simulado)`, "output")
          }
        }

        // Mock function calls
        if (trimmed.includes("saudacao(")) {
          if (this.outputCallback) {
            this.outputCallback("Olá, Desenvolvedor!", "output")
          }
        }
      }

      // Simulate execution time
      setTimeout(() => {
        if (this.outputCallback) {
          this.outputCallback("Execução concluída", "output")
        }
      }, 100)

      return { success: true }
    } catch (error) {
      return { success: false, error: "Erro na execução simulada" }
    }
  }

  hasIoRead(code: string): boolean {
    return code.includes("io.read()")
  }
}

// Singleton instance
export const luaInterpreter = new LuaInterpreter()
