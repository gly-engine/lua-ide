"use client"

import Editor, { OnChange, useMonaco, EditorProps } from "@monaco-editor/react"
import { useEffect, useRef } from "react"
import { parseTmTheme } from "monaco-themes"
import { useTheme } from "./theme-provider"

const themes = {
  active4d: () => import("monaco-themes/themes/Active4D.json"),
  "all-hallows-eve": () => import("monaco-themes/themes/All Hallows Eve.json"),
  amy: () => import("monaco-themes/themes/Amy.json"),
  "birds-of-paradise": () => import("monaco-themes/themes/Birds of Paradise.json"),
  blackboard: () => import("monaco-themes/themes/Blackboard.json"),
  "brilliance-black": () => import("monaco-themes/themes/Brilliance Black.json"),
  "brilliance-dull": () => import("monaco-themes/themes/Brilliance Dull.json"),
  "chrome-devtools": () => import("monaco-themes/themes/Chrome DevTools.json"),
  "clouds-midnight": () => import("monaco-themes/themes/Clouds Midnight.json"),
  clouds: () => import("monaco-themes/themes/Clouds.json"),
  cobalt: () => import("monaco-themes/themes/Cobalt.json"),
  cobalt2: () => import("monaco-themes/themes/Cobalt2.json"),
  dawn: () => import("monaco-themes/themes/Dawn.json"),
  "dominion-day": () => import("monaco-themes/themes/Dominion Day.json"),
  dracula: () => import("monaco-themes/themes/Dracula.json"),
  dreamweaver: () => import("monaco-themes/themes/Dreamweaver.json"),
  eiffel: () => import("monaco-themes/themes/Eiffel.json"),
  "espresso-libre": () => import("monaco-themes/themes/Espresso Libre.json"),
  github: () => import("monaco-themes/themes/GitHub.json"),
  idle: () => import("monaco-themes/themes/IDLE.json"),
  "idle-fingers": () => import("monaco-themes/themes/idleFingers.json"),
  iplastic: () => import("monaco-themes/themes/iPlastic.json"),
  katzenmilch: () => import("monaco-themes/themes/Katzenmilch.json"),
  "kr-theme": () => import("monaco-themes/themes/krTheme.json"),
  kuroir: () => import("monaco-themes/themes/Kuroir Theme.json"),
  lazy: () => import("monaco-themes/themes/LAZY.json"),
  "magic-wb": () => import("monaco-themes/themes/MagicWB (Amiga).json"),
  "merbivore-soft": () => import("monaco-themes/themes/Merbivore Soft.json"),
  merbivore: () => import("monaco-themes/themes/Merbivore.json"),
  monoindustrial: () => import("monaco-themes/themes/monoindustrial.json"),
  monokai: () => import("monaco-themes/themes/Monokai.json"),
  "monokai-bright": () => import("monaco-themes/themes/Monokai Bright.json"),
  "night-owl": () => import("monaco-themes/themes/Night Owl.json"),
  nord: () => import("monaco-themes/themes/Nord.json"),
  "oceanic-next": () => import("monaco-themes/themes/Oceanic Next.json"),
  "pastels-on-dark": () => import("monaco-themes/themes/Pastels on Dark.json"),
  "slush-and-poppies": () => import("monaco-themes/themes/Slush and Poppies.json"),
  "solarized-dark": () => import("monaco-themes/themes/Solarized-dark.json"),
  "solarized-light": () => import("monaco-themes/themes/Solarized-light.json"),
  "space-cadet": () => import("monaco-themes/themes/SpaceCadet.json"),
  sunburst: () => import("monaco-themes/themes/Sunburst.json"),
  textmate: () => import("monaco-themes/themes/Textmate (Mac Classic).json"),
  tomorrow: () => import("monaco-themes/themes/Tomorrow.json"),
  "tomorrow-night": () => import("monaco-themes/themes/Tomorrow-Night.json"),
  "tomorrow-night-blue": () => import("monaco-themes/themes/Tomorrow-Night-Blue.json"),
  "tomorrow-night-bright": () => import("monaco-themes/themes/Tomorrow-Night-Bright.json"),
  "tomorrow-night-eighties": () => import("monaco-themes/themes/Tomorrow-Night-Eighties.json"),
  twilight: () => import("monaco-themes/themes/Twilight.json"),
  "upstream-sunburst": () => import("monaco-themes/themes/Upstream Sunburst.json"),
  "vibrant-ink": () => import("monaco-themes/themes/Vibrant Ink.json"),
  xcode: () => import("monaco-themes/themes/Xcode_default.json"),
  zenburnesque: () => import("monaco-themes/themes/Zenburnesque.json"),
}

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  onMount?: EditorProps['onMount']
  readOnly?: boolean
  virtualKeyboardActive?: boolean
}

export function MonacoEditor({ value, onChange, onMount, readOnly, virtualKeyboardActive }: MonacoEditorProps) {
  const { actualTheme, settings } = useTheme()
  const monaco = useMonaco()
  const editorContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (monaco) {
      const defineThemesPromises = Object.entries(themes).map(([themeName, importTheme]) => {
        return importTheme().then(themeData => {
          monaco.editor.defineTheme(themeName, themeData as any)
        })
      })

      Promise.all(defineThemesPromises).then(() => {
        monaco.editor.setTheme(settings.editorTheme)
      })
    }
  }, [monaco, settings.editorTheme])

  useEffect(() => {
    if (editorContainerRef.current) {
      const textarea = editorContainerRef.current.querySelector('textarea');
      if (textarea) {
        textarea.readOnly = !!virtualKeyboardActive;
      }
    }
  }, [virtualKeyboardActive, monaco]);

  const getEditorTheme = () => {
    return settings.editorTheme
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
    <div ref={editorContainerRef} className="h-full w-full">
      <Editor
        height="100%"
        language="lua"
        theme={getEditorTheme()}
        value={value}
        onChange={handleEditorChange}
        onMount={onMount}
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
          readOnly: readOnly,
          cursorStyle: "line",
        }}
        loading={<div className="flex items-center justify-center h-full bg-muted">Carregando editor...</div>}
      />
    </div>
  )
}