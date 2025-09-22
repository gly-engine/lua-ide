"use client"

import { LuaFactory, LuaEngine, LuaLibraries } from "wasmoon"

class WasmoonInterpreter {
    private engine: LuaEngine | null = null
    private outputCallback: (output: string, type: "output" | "error") => void = () => {}

    public async initialize() {
        const factory = new LuaFactory()
        this.engine = await factory.createEngine()

        // Redirect print to output callback
        this.engine.global.set("print", (message: any) => {
            this.outputCallback(String(message), "output")
        })
    }

    public setOutputCallback(callback: (output: string, type: "output" | "error") => void) {
        this.outputCallback = callback
    }

    public async executeCode(code: string): Promise<{ success: boolean; error?: string }> {
        if (!this.engine) {
            await this.initialize()
        }

        try {
            await this.engine!.doString(code)
            return { success: true }
        } catch (error: any) {
            return { success: false, error: error.message }
        } finally {
            this.destroy()
        }
    }

    public hasIoRead(code: string): boolean {
        // Simplified: io.read is not supported for now
        return false
    }

    public destroy() {
        if (this.engine) {
            this.engine.global.close()
            this.engine = null
        }
    }
}

export const wasmoonInterpreter = new WasmoonInterpreter()