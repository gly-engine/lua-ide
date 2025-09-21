import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ModalProvider } from "@/components/modal-system"
import "./globals.css"

export const metadata: Metadata = {
  title: "Gly Engine - Lua IDE",
  description: "Modern Lua IDE powered by Monaco Editor",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ModalProvider>
          <Suspense fallback={null}>
            {children}
            <Analytics />
          </Suspense>
        </ModalProvider>
      </body>
    </html>
  )
}
