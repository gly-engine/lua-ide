"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Terminal, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { luaInterpreter } from "@/lib/lua-interpreter"
import { useMobile } from "@/hooks/use-mobile"

interface OutputLine {
  type: "output" | "error" | "input" | "system"
  content: string
  timestamp: Date
}

interface OutputConsoleProps {
  currentCode?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function OutputConsole({ currentCode = "", isCollapsed = false, onToggleCollapse }: OutputConsoleProps) {
  const [output, setOutput] = useState<OutputLine[]>([
    {
      type: "system",
      content: "🚀 Gly Engine Lua IDE - Console de Saída",
      timestamp: new Date(),
    },
    {
      type: "system",
      content: "Clique em 'Rodar' para executar seu código Lua",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isInputEnabled, setIsInputEnabled] = useState(false)
  const [isWaitingForInput, setIsWaitingForInput] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputResolveRef = useRef<((value: string) => void) | null>(null)
  const isMobile = useMobile()

  const addOutput = (content: string, type: "output" | "error" | "input" | "system" = "output") => {
    setOutput((prev) => [...prev, { type, content, timestamp: new Date() }])
  }

  // Initialize Lua interpreter
  useEffect(() => {
    luaInterpreter.initialize()

    luaInterpreter.setOutputCallback((output, type) => {
      addOutput(output, type)
    })

    luaInterpreter.setInputCallback(() => {
      return new Promise<string>((resolve) => {
        setIsInputEnabled(true)
        setIsWaitingForInput(true)
        inputResolveRef.current = resolve
      })
    })
  }, [])

  // Check if current code has io.read() and enable input accordingly
  useEffect(() => {
    if (currentCode) {
      const hasIoRead = luaInterpreter.hasIoRead(currentCode)
      if (hasIoRead && !isWaitingForInput) {
        addOutput("Código contém io.read() - campo de entrada será ativado durante execução", "system")
      }
    }
  }, [currentCode, isWaitingForInput])

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      addOutput(`> ${inputValue}`, "input")

      if (inputResolveRef.current) {
        inputResolveRef.current(inputValue)
        inputResolveRef.current = null
      }

      setInputValue("")
      setIsInputEnabled(false)
      setIsWaitingForInput(false)
    }
  }

  const clearOutput = () => {
    setOutput([
      {
        type: "system",
        content: "Console limpo",
        timestamp: new Date(),
      },
    ])
  }

  const executeCurrentCode = async () => {
    if (!currentCode.trim()) {
      addOutput("Nenhum código para executar", "error")
      return
    }

    addOutput("Executando código...", "system")

    try {
      const result = await luaInterpreter.executeCode(currentCode)
      if (!result.success && result.error) {
        addOutput(`Erro: ${result.error}`, "error")
      }
    } catch (error) {
      addOutput(`Erro inesperado: ${error}`, "error")
    }
  }

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (scrollAreaRef.current && !isCollapsed) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [output, isCollapsed])

  if (isCollapsed) {
    return (
      <div className="h-full flex items-center justify-between px-2 sm:px-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Console</span>
          {output.length > 2 && <span className="text-xs text-muted-foreground">({output.length - 2})</span>}
        </div>
        <Button size="sm" variant="ghost" onClick={onToggleCollapse} className="px-2">
          <ChevronUp className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-card console-container">
      {/* Console Header */}
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 border-b border-border bg-muted/50 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium truncate">{isMobile ? "Console" : "Console de Saída"}</span>
          {isWaitingForInput && (
            <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded hidden sm:inline">
              Aguardando entrada
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isMobile && (
            <Button size="sm" variant="outline" onClick={executeCurrentCode} className="px-2 bg-transparent">
              <Terminal className="w-3 h-3 mr-1" />
              Executar
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={clearOutput} className="px-2">
            <Trash2 className="w-3 h-3" />
            {!isMobile && <span className="ml-1">Limpar</span>}
          </Button>
          {onToggleCollapse && (
            <Button size="sm" variant="ghost" onClick={onToggleCollapse} className="px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Output Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-2 sm:p-4 min-h-0">
        <div className="space-y-1 font-mono text-xs sm:text-sm">
          {output.map((line, index) => (
            <div
              key={index}
              className={`flex gap-2 ${
                line.type === "error"
                  ? "text-destructive"
                  : line.type === "input"
                    ? "text-primary font-medium"
                    : line.type === "system"
                      ? "text-muted-foreground italic"
                      : "text-foreground"
              }`}
            >
              <span className="text-muted-foreground text-xs min-w-[50px] sm:min-w-[60px] flex-shrink-0">
                {line.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  ...(isMobile ? {} : { second: "2-digit" }),
                })}
              </span>
              <span className="flex-1 break-words">{line.content}</span>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-2 sm:p-4 border-t border-border bg-muted/30 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isInputEnabled
                ? isMobile
                  ? "Digite aqui..."
                  : "Digite sua entrada e pressione Enter..."
                : isWaitingForInput
                  ? "Aguardando..."
                  : "Entrada desabilitada"
            }
            disabled={!isInputEnabled}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInputSubmit()
              }
            }}
            className="font-mono text-sm mobile-text"
          />
          <Button size="sm" onClick={handleInputSubmit} disabled={!isInputEnabled} className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {!isMobile && (
          <div className="text-xs text-muted-foreground mt-2">
            {isInputEnabled
              ? "Campo de entrada ativo - digite e pressione Enter"
              : isWaitingForInput
                ? "Aguardando ativação do campo de entrada"
                : "Use io.read() no código para ativar entrada durante execução"}
          </div>
        )}
      </div>
    </div>
  )
}
