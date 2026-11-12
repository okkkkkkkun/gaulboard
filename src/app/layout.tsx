import type { Metadata, Viewport } from "next"
import type { ReactNode } from "react"
import "@fontsource/zen-kaku-gothic-new/japanese-400.css"
import "@fontsource/zen-kaku-gothic-new/japanese-500.css"
import "@fontsource/zen-kaku-gothic-new/japanese-700.css"
import "@fontsource/zen-kaku-gothic-new/latin-400.css"
import "@fontsource/zen-kaku-gothic-new/latin-500.css"
import "@fontsource/zen-kaku-gothic-new/latin-700.css"
import "@fontsource/shippori-mincho/japanese-500.css"
import "@fontsource/shippori-mincho/japanese-600.css"
import "@fontsource/shippori-mincho/japanese-700.css"
import "@fontsource/shippori-mincho/latin-500.css"
import "@fontsource/shippori-mincho/latin-700.css"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import "./globals.css"

export const viewport: Viewport = {
  themeColor: "#3A1458",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: {
    default: "ガウルボード",
    template: "%s · ガウルボード",
  },
  description: "サンフレッチェ広島の試合メモを、一枚の戦術カードにする。",
  applicationName: "ガウルボード",
  appleWebApp: {
    capable: true,
    title: "ガウルボード",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
