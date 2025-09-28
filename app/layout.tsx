import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ModalProvider } from "@/components/modal-system"
import ServiceWorkerUpdateNotification from "@/components/service-worker-update-notification";
import "./globals.css"
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const metadata: Metadata = {
  title: "Lua IDE",
  description: "Run and share Lua code instantly in your browser -- no login, no installs, just coding!",
  themeColor: "#000080",
  appleWebApp: {
    statusBarStyle: "black-translucent",
    title: "Lua IDE",
  },
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
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
  const manifestHash = crypto.createHash('md5').update(manifestContent).digest('hex');
  const manifestUrl = `/manifest.json?v=${manifestHash}`;

  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes"/> 
        <link rel="apple-touch-icon" href="/logo-192x192.png" />
        <link rel="manifest" href={manifestUrl} />x
      </head>
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
