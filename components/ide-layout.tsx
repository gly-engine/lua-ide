"use client"

import { useState, useEffect, useRef } from "react"
import { MonacoEditor } from "./monaco-editor"
import { OutputConsole } from "./output-console"
import { IDEHeader } from "./ide-header"
import { HistoryManager } from "@/lib/history-manager"
import { decompressCode } from "@/lib/compression";
import { wasmoonInterpreter } from "@/lib/wasmoon-interpreter"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "./theme-provider"

export function IDELayout() {
  const [code, setCode] = useState("")
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager())
  const { settings, updateSettings } = useTheme()
  const { toast } = useToast()
  const isMobile = useMobile()
  const lastSaveTimeRef = useRef<number>(0)

  useEffect(() => {
    const initializeCode = async () => {
      const hash = window.location.hash;
      if (hash.startsWith("#code=")) {
        const encodedCode = hash.substring(6);
        try {
          const decodedCode = await decompressCode(encodedCode);
          setCode(decodedCode);
          historyManagerRef.current = new HistoryManager(decodedCode);
          toast({
            title: "Código carregado do link",
            description: "O código compartilhado foi carregado com sucesso.",
          });
          // Clean the URL hash
          window.history.replaceState(null, "", " ");
          return;
        } catch (error) {
          console.error("Failed to decompress code from URL:", error);
          toast({
            title: "Erro ao carregar código",
            description: "O link de código compartilhado parece estar corrompido.",
            variant: "destructive",
          });
        }
      }

      // Then try localStorage if auto-save is enabled
      if (settings.autoSave) {
        const savedCode = localStorage.getItem("lua-ide-code");
        if (savedCode) {
          setCode(savedCode);
          historyManagerRef.current = new HistoryManager(savedCode);
          return;
        }
      }

      // Finally, use default code
      const defaultCode = `-- Bem-vindo ao Gly Engine Lua IDE\nprint("Olá, mundo!")\n\n-- Exemplo de função\nfunction saudacao(nome)\n    return "Olá, " .. nome .. "!"\nend\n\nprint(saudacao("Desenvolvedor"))\n\n-- Exemplo com entrada do usuário (descomente para testar)\n-- print("Digite seu nome:")\n-- nome = io.read()\n-- print("Olá, " .. nome .. "!")`;

      setCode(defaultCode);
      historyManagerRef.current = new HistoryManager(defaultCode);
    };

    initializeCode();
  }, [settings.autoSave, toast]);

  useEffect(() => {
    if (isMobile) {
      setIsConsoleCollapsed(true)
    }
  }, [isMobile])

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)

    // Add to history with debouncing (only if significant time has passed)
    const now = Date.now()
    if (now - lastSaveTimeRef.current > 1000) {
      // 1 second debounce
      historyManagerRef.current.addState(newCode)
      lastSaveTimeRef.current = now
    }
  }

  const handleRunCode = async () => {
    if (isMobile && isConsoleCollapsed) {
      setIsConsoleCollapsed(false)
    }

    setIsRunning(true)
    try {
      await wasmoonInterpreter.executeCode(code)
    } catch (error) {
      toast({
        title: "Erro na execução",
        description: "Erro inesperado ao executar o código",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleStopCode = () => {
    wasmoonInterpreter.destroy()
    setIsRunning(false)
  }

  const handleUndo = () => {
    const previousState = historyManagerRef.current.undo()
    if (previousState) {
      setCode(previousState.code)
    }
  }

  const handleRedo = () => {
    const nextState = historyManagerRef.current.redo()
    if (nextState) {
      setCode(nextState.code)
    }
  }

  const handleCodeLoad = (newCode: string, filename?: string) => {
    setCode(newCode)
    historyManagerRef.current.clear()
    historyManagerRef.current.addState(newCode)

    if (filename) {
      toast({
        title: "Código carregado",
        description: `Arquivo: ${filename}`,
      })
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      <IDEHeader
        code={code}
        onCodeChange={handleCodeLoad}
        onRunCode={handleRunCode}
        onStopCode={handleStopCode}
        isRunning={isRunning}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyManagerRef.current.canUndo()}
        canRedo={historyManagerRef.current.canRedo()}
        onSettingsChange={updateSettings}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div
          className={`${
            isConsoleCollapsed
              ? "flex-1"
              : isMobile
                ? "hidden" // Hide editor completely on mobile when console is open
                : "flex-1"
          } min-h-0 overflow-hidden`}
        >
          <MonacoEditor value={code} onChange={handleCodeChange} />
        </div>

        <div
          className={`border-t border-border transition-all duration-300 flex-shrink-0 ${
            isConsoleCollapsed
              ? "h-12"
              : isMobile
                ? "flex-1" // Take full remaining height on mobile
                : "h-64"
          }`}
        >
          <OutputConsole
            currentCode={code}
            isCollapsed={isConsoleCollapsed}
            onToggleCollapse={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          />
        </div>
      </div>
    </div>
  )
}