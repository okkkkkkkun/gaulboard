import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-[11px] tracking-[0.18em] text-[#5C2D86]">404</p>
        <h1 className="mt-2 font-mincho text-3xl">そのシートはありません</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6d6274]">削除されたか、アドレスが違います。</p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 inline-flex h-11 px-4")}>
          アーカイブへ戻る
        </Link>
      </main>
    </>
  )
}
