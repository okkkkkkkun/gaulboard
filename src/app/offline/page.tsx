import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export const metadata = { title: "オフライン" }

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[11px] tracking-[0.18em] text-[#5C2D86]">OFFLINE</p>
        <h1 className="mt-2 font-mincho text-3xl">いまはオフラインです</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6d6274]">
          この端末に保存したカードは、アーカイブを開いたことがあれば読めます。通信が戻ってから、まだ見ていないページを開いてください。
        </p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex h-11 px-4")}>
          アーカイブへ戻る
        </Link>
      </main>
    </>
  )
}
