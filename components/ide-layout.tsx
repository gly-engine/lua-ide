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
import VirtualKeyboard from "./virtual-keyboard"
import eventBus from "@/lib/event-bus"
import { editor } from "monaco-editor"

export function IDELayout() {
  const [code, setCode] = useState("")
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const historyManagerRef = useRef<HistoryManager>(new HistoryManager())
  const { settings, updateSettings } = useTheme()
  const { toast } = useToast()
  const isMobile = useMobile()
  const lastSaveTimeRef = useRef<number>(0)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const showVirtualKeyboard = isMobile && settings.keyboard.enabled;

  useEffect(() => {
    const handleKeyPress = (button: string) => {
      const editor = editorRef.current;
      if (!editor) return;

      switch (button) {
        case "{bksp}":
          editor.trigger('keyboard', 'deleteLeft', null);
          break;
        case "{enter}":
          editor.trigger('keyboard', 'type', { text: '\n' });
          break;
        case "{tab}":
          editor.trigger('keyboard', 'tab', null);
          break;
        case "{space}":
          editor.trigger('keyboard', 'type', { text: ' ' });
          break;
        case "{arrowup}":
          editor.trigger('keyboard', 'cursorUp', null);
          break;
        case "{arrowdown}":
          editor.trigger('keyboard', 'cursorDown', null);
          break;
        case "{arrowleft}":
          editor.trigger('keyboard', 'cursorLeft', null);
          break;
        case "{arrowright}":
          editor.trigger('keyboard', 'cursorRight', null);
          break;
        case "{shift}":
        case "{lock}":
        case "{numbers}":
        case "{abc}":
          // Handled by keyboard component
          break;
        default:
          editor.trigger('keyboard', 'type', { text: button });
          break;
      }
      editor.focus();
    };

    eventBus.on('keypress', handleKeyPress);
    return () => {
      eventBus.off('keypress', handleKeyPress);
    };
  }, []);

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

      if (settings.autoSave) {
        const savedCode = localStorage.getItem("lua-ide-code");
        if (savedCode) {
          setCode(savedCode);
          historyManagerRef.current = new HistoryManager(savedCode);
          return;
        }
      }

      const defaultCode = `-- Bem-vindo ao Gly Engine Lua IDE\nprint("Olá, mundo!")\n\n-- Exemplo de função\nfunction saudacao(nome)\n    return "Olá, " .. nome .. "!"\nend\n\nprint(saudacao("Desenvolvedor"))\n
-- Exemplo com entrada do usuário (descomente para testar)\n-- print("Digite seu nome:")\n-- nome = io.read()\n-- print("Olá, " .. nome .. "!")`;

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

    const now = Date.now()
    if (now - lastSaveTimeRef.current > 1000) {
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

  const handleEditorMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

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
                ? "hidden"
                : "flex-1"
          } min-h-0 overflow-hidden`}
        >
          <MonacoEditor
            value={code}
            onChange={handleCodeChange}
            onMount={handleEditorMount}
            virtualKeyboardActive={showVirtualKeyboard}
          />
        </div>

        <div
          className={`border-t border-border transition-all duration-300 flex-shrink-0 ${
            isConsoleCollapsed
              ? "h-12"
              : isMobile
                ? "flex-1"
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
      {showVirtualKeyboard && <VirtualKeyboard settings={settings} />}
    </div>
  )
}