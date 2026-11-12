import type { Metadata } from "next"
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
import "./globals.css"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const metadata: Metadata = {
  title: {
    default: "ガウルボード",
    template: "%s · ガウルボード",
  },
  description: "サンフレッチェ広島の試合メモを、一枚の戦術カードにする。",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
