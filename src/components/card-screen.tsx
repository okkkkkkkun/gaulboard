"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toPng } from "html-to-image"
import { TacticalCard } from "@/components/tactical-card"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { exportNotion, removeCard } from "@/app/actions"
import { downloadName } from "@/lib/card-logic"
import { cn } from "cn"
import type { Card } from "@/lib/types"

export function CardScreen({
  card,
  notionEnabled,
  sample,
}: {
  card: Card
  notionEnabled: boolean
  sample: boolean
}) {
  const router = useRouter()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [notionState, setNotionState] = useState<"idle" | "sending" | "done">("idle")
  const [notionUrl, setNotionUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function onExport() {
    const node = sheetRef.current
    if (!node) return
    setExporting(true)
    setError(null)
    try {
      await document.fonts.ready
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#FBF8F3",
      })
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = downloadName(card)
      link.click()
    } catch {
      setError("画像にできませんでした。もう一度試してください。")
    } finally {
      setExporting(false)
    }
  }

  async function onNotion() {
    setNotionState("sending")
    setError(null)
    const result = await exportNotion(card.id)
    if (!result.ok) {
      setNotionState("idle")
      setError(result.message)
      return
    }
    setNotionUrl(result.url)
    setNotionState("done")
  }

  async function onDelete() {
    const result = await removeCard(card.id)
    if (!result.ok) {
      setError(result.message)
      setConfirmDelete(false)
      return
    }
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          アーカイブ
        </Link>
        <Link href={`/matches/${card.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
          編集
        </Link>
        <Button type="button" size="lg" onClick={() => void onExport()} disabled={exporting}>
          {exporting ? "書き出し中…" : "PNGで保存"}
        </Button>
        <Button type="button" size="lg" variant="secondary" disabled={!notionEnabled || notionState === "sending"} onClick={() => void onNotion()}>
          {notionState === "sending" ? "Notionへ送っています…" : "Notionへ送る"}
        </Button>
        <Button type="button" size="lg" variant="ghost" className="text-[#7A2E2E]" onClick={() => setConfirmDelete(true)}>
          削除
        </Button>
      </div>
      {sample ? (
        <p className="mb-4 rounded-lg bg-[#EFE6F6] px-3 py-2 text-sm text-[#3A1458]">
          これは初回に入っているサンプルです。町田戦の公開情報をもとにしたメモなので、編集しても消しても構いません。
        </p>
      ) : null}
      {!notionEnabled ? (
        <p className="mb-4 text-xs leading-relaxed text-[#6d6274]">
          Notionへの書き出しはオフです。NOTION_API_TOKEN と NOTION_DATABASE_ID をサーバーに入れると、このカードをデータベースへ送れます。
        </p>
      ) : null}
      {notionUrl ? (
        <p className="mb-4 text-sm">
          <a href={notionUrl} className="text-[#5C2D86] underline underline-offset-2" target="_blank" rel="noreferrer">
            Notionに書き出しました
          </a>
        </p>
      ) : null}
      {error ? <p className="mb-4 rounded-lg bg-[#F8E8E4] px-3 py-2 text-sm text-[#7A2E2E]">{error}</p> : null}
      <div ref={sheetRef}>
        <TacticalCard card={card} />
      </div>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>このカードを削除します</DialogTitle>
            <DialogDescription>アーカイブからも消えます。戻す操作はありません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
              戻る
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onDelete()}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
