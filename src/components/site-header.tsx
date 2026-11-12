import type { ReactNode } from "react"
import Link from "next/link"
import { Mark } from "@/components/mark"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "cn"

export function SiteHeader({ action }: { action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#3A1458] pt-[env(safe-area-inset-top)] text-[#F6F1E8]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Mark light />
          <span className="min-w-0">
            <span className="block font-mincho text-lg leading-none tracking-wide">ガウルボード</span>
            <span className="mt-1 block truncate text-[10px] tracking-[0.16em] text-white/65">
              広島の試合を、一枚にする
            </span>
          </span>
        </Link>
        {action ?? (
          <Link
            href="/matches/new"
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 bg-[#F6F1E8] px-3 text-[#3A1458] hover:bg-white")}
          >
            新しい試合
          </Link>
        )}
      </div>
    </header>
  )
}
