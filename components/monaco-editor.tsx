"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "./theme-provider"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const monacoRef = useRef<any>(null)
  const editorInstanceRef = useRef<any>(null)
  const { actualTheme, settings } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMonaco = async () => {
      try {
        // Load Monaco Editor dynamically
        const monaco = await import("monaco-editor")
        monacoRef.current = monaco

        // Configure Monaco for Lua
        monaco.languages.register({ id: "lua" })

        // Set up Lua language configuration
        monaco.languages.setLanguageConfiguration("lua", {
          comments: {
            lineComment: "--",
            blockComment: ["--[[", "]]"],
          },
          brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
          ],
          autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
          surroundingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
        })

        // Set up Lua syntax highlighting
        monaco.languages.setMonarchTokensProvider("lua", {
          keywords: [
            "and",
            "break",
            "do",
            "else",
            "elseif",
            "end",
            "false",
            "for",
            "function",
            "if",
            "in",
            "local",
            "nil",
            "not",
            "or",
            "repeat",
            "return",
            "then",
            "true",
            "until",
            "while",
          ],
          operators: [
            "=",
            ">",
            "<",
            "!",
            "~",
            "?",
            ":",
            "==",
            "<=",
            ">=",
            "!=",
            "&&",
            "||",
            "++",
            "--",
            "+",
            "-",
            "*",
            "/",
            "&",
            "|",
            "^",
            "%",
            "<<",
            ">>",
            ">>>",
            "+=",
            "-=",
            "*=",
            "/=",
            "&=",
            "|=",
            "^=",
            "%=",
            "<<=",
            ">>=",
            ">>>=",
          ],
          symbols: /[=><!~?:&|+\-*/^%]+/,
          tokenizer: {
            root: [
              [/[a-zA-Z_]\w*/, { cases: { "@keywords": "keyword", "@default": "identifier" } }],
              [/[{}()[\]]/, "@brackets"],
              [/[<>](?!@symbols)/, "@brackets"],
              [/@symbols/, { cases: { "@operators": "operator", "@default": "" } }],
              [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
              [/0[xX][0-9a-fA-F]+/, "number.hex"],
              [/\d+/, "number"],
              [/[;,.]/, "delimiter"],
              [/"([^"\\]|\\.)*$/, "string.invalid"],
              [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
              [/'([^'\\]|\\.)*$/, "string.invalid"],
              [/'/, { token: "string.quote", bracket: "@open", next: "@stringsingle" }],
              [/--\[\[/, { token: "comment", next: "@commentblock" }],
              [/--.*$/, "comment"],
            ],
            commentblock: [
              [/[^\]]+/, "comment"],
              [/\]\]/, { token: "comment", next: "@pop" }],
              [/[\]]/, "comment"],
            ],
            string: [
              [/[^\\"]+/, "string"],
              [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
            ],
            stringsingle: [
              [/[^\\']+/, "string"],
              [/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
            ],
          },
        })

        // Create editor instance
        if (editorRef.current) {
          editorInstanceRef.current = monaco.editor.create(editorRef.current, {
            value: value,
            language: "lua",
            theme: getEditorTheme(),
            fontSize: settings.fontSize,
            fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
            lineNumbers: "on",
            minimap: { enabled: settings.minimap },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: settings.tabSize,
            insertSpaces: true,
            wordWrap: settings.wordWrap ? "on" : "off",
            contextmenu: true,
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: "line",
          })

          // Handle content changes
          editorInstanceRef.current.onDidChangeModelContent(() => {
            const currentValue = editorInstanceRef.current.getValue()
            onChange(currentValue)
            // Auto-save to localStorage if enabled
            if (settings.autoSave) {
              localStorage.setItem("lua-ide-code", currentValue)
            }
          })

          setIsLoading(false)
        }
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error)
        setIsLoading(false)
      }
    }

    loadMonaco()

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose()
      }
    }
  }, [])

  const getEditorTheme = () => {
    // Use custom editor theme if set, otherwise fall back to window theme
    if (settings.editorTheme !== "vs" && settings.editorTheme !== "vs-dark") {
      return settings.editorTheme
    }
    return actualTheme === "dark" ? "vs-dark" : "vs"
  }

  // Update editor settings when they change
  useEffect(() => {
    if (editorInstanceRef.current && monacoRef.current) {
      const editor = editorInstanceRef.current

      // Update theme
      monacoRef.current.editor.setTheme(getEditorTheme())

      // Update editor options
      editor.updateOptions({
        fontSize: settings.fontSize,
        tabSize: settings.tabSize,
        wordWrap: settings.wordWrap ? "on" : "off",
        minimap: { enabled: settings.minimap },
      })
    }
  }, [actualTheme, settings])

  // Load saved code on mount
  useEffect(() => {
    if (settings.autoSave) {
      const savedCode = localStorage.getItem("lua-ide-code")
      if (savedCode && savedCode !== value) {
        onChange(savedCode)
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setValue(savedCode)
        }
      }
    }
  }, [settings.autoSave])

  // Update editor value when prop changes
  useEffect(() => {
    if (editorInstanceRef.current && editorInstanceRef.current.getValue() !== value) {
      editorInstanceRef.current.setValue(value)
    }
  }, [value])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <div className="text-muted-foreground">Carregando editor...</div>
      </div>
    )
  }

  return <div ref={editorRef} className="h-full w-full" />
}
