"use client"

import Editor, { OnChange } from "@monaco-editor/react"
import { useTheme } from "./theme-provider"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  const { actualTheme, settings } = useTheme()

  const getEditorTheme = () => {
    return settings.editorTheme;
  }

  const handleEditorChange: OnChange = value => {
    if (value) {
      onChange(value)
      if (settings.autoSave) {
        localStorage.setItem("lua-ide-code", value)
      }
    }
  }

  return (
    <Editor
      key={JSON.stringify(settings)}
      height="100%"
      language="lua"
      theme={getEditorTheme()}
      value={value}
      onChange={handleEditorChange}
      options={{
        fontSize: settings.fontSize,
        fontFamily: "var(--font-geist-mono), 'Courier New', monospace",
        lineNumbers: settings.lineNumbers,
        minimap: { enabled: settings.minimap },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        insertSpaces: true,
        wordWrap: settings.wordWrap ? "on" : "off",
        contextmenu: true,
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: "line",
      }}
      loading={<div className="flex items-center justify-center h-full bg-muted">Carregando editor...</div>}
    />
  )
}