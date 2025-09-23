"use client"

import { useState } from "react"
import { IDELayout } from "@/components/ide-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SplashScreen } from "@/components/splash-screen"

export default function LuaIDE() {
  const [isEditorReady, setIsEditorReady] = useState(false)

  const handleEditorReady = () => {
    setIsEditorReady(true)
  }

  return (
    <ThemeProvider>
      {!isEditorReady && <SplashScreen />}
      <div style={{ display: isEditorReady ? 'block' : 'none' }}>
        <IDELayout onEditorReady={handleEditorReady} />
      </div>
      <Toaster />
    </ThemeProvider>
  )
}
