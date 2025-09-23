import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ModalProvider } from "@/components/modal-system"
import ServiceWorkerUpdateNotification from "@/components/service-worker-update-notification";
import "./globals.css"

export const metadata: Metadata = {
  title: "Lua IDE",
  description: "Run and share Lua code instantly in your browser -- no login, no installs, just coding!",
}

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: "no",
};

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
        <ServiceWorkerUpdateNotification />
      </body>
    </html>
  )
}
