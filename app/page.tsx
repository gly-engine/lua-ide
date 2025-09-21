"use client"

import { IDELayout } from "@/components/ide-layout"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function LuaIDE() {
  return (
    <ThemeProvider>
      <IDELayout />
      <Toaster />
    </ThemeProvider>
  )
}
