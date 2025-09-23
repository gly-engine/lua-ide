"use client"

import { CodeXml } from "lucide-react"

export function SplashScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <div className="flex items-center space-x-4">
        <CodeXml className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold">Lua IDE</h1>
      </div>
      <div className="mt-8">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    </div>
  )
}
