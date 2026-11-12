"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { PitchGraphic } from "@/components/pitch-graphic"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { buttonVariants } from "@/components/ui/button"
import {
  competitionOptions,
  filterCards,
  formatDateJa,
  resultOf,
  scoreboard,
  VENUE_LABEL,
} from "@/lib/card-logic"
import { backupFilename } from "@/lib/backup"
import { exportArchiveJson, importArchiveJson, readCards } from "@/lib/repository"
import { SEED_CARD_ID } from "@/lib/seed"
import { shareOrDownload } from "@/lib/share-file"
import { cn } from "cn"
import type { Card } from "@/lib/types"

export function ArchiveScreen() {
  const [cards, setCards] = useState<Card[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [opponent, setOpponent] = useState("")
  const [competition, setCompetition] = useState("all")

  async function reload() {
    setCards(await readCards())
  }

  useEffect(() => {
    let cancelled = false
    readCards()
      .then((next) => {
        if (!cancelled) setCards(next)
      })
      .catch(() => {
        if (!cancelled) setLoadError("このブラウザではカードを読めませんでした。")
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function onExport() {
    if (!cards) return
    const json = await exportArchiveJson()
    const file = new File([json], backupFilename(), { type: "application/json" })
    await shareOrDownload(file)
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return
    const text = await file.text()
    setImportError(null)
    setPendingImport(text)
  }

  async function confirmImport() {
    if (!pendingImport) return
    const result = await importArchiveJson(pendingImport)
    if (!result.ok) {
      setImportError(result.message)
      setPendingImport(null)
      return
    }
    await reload()
    setPendingImport(null)
    setNotice(`${result.count}枚のカードで置き換えました。`)
  }
  const options = useMemo(() => competitionOptions(cards ?? []), [cards])
  const competitionItems = useMemo(
    () => [{ value: "all", label: "すべての大会" }, ...options.map((option) => ({ value: option, label: option }))],
    [options],
  )
  const filtered = cards ? filterCards(cards, { opponent, competition }) : []

  if (loadError) {
    return <p className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-[#7A2E2E]">{loadError}</p>
  }
  if (!cards) {
    return <p className="px-4 py-10 text-sm text-[#6d6274]">読み込んでいます…</p>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-8">
      <div>
        <p className="text-[11px] tracking-[0.18em] text-[#5C2D86]">ARCHIVE</p>
        <h1 className="font-mincho text-3xl text-[#24142F] sm:text-4xl">試合のシート</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5c5462]">
          終わった試合のメモと配置を、この端末に一枚のカードとして残します。ホーム画面に追加すると、電波がなくても開けます。
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => void onExport()}>
            JSONを書き出す
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => fileRef.current?.click()}>
            JSONを読み込む
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              void onPickFile(file)
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-center">
        <Input
          value={opponent}
          placeholder="対戦相手で探す"
          aria-label="対戦相手で探す"
          className="h-11"
          onChange={(event) => setOpponent(event.target.value)}
        />
        <Select
          items={competitionItems}
          value={competition}
          onValueChange={(value) => setCompetition(value ?? "all")}
        >
          <SelectTrigger className="h-11 w-full" aria-label="大会で絞り込む">
            <SelectValue placeholder="すべての大会" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべての大会</SelectItem>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-[#6d6274]">{filtered.length} 件</p>
      </div>
      {notice ? <p className="mt-4 rounded-lg bg-[#EFE6F6] px-3 py-2 text-sm text-[#3A1458]">{notice}</p> : null}
      {importError ? <p className="mt-4 rounded-lg bg-[#F8E8E4] px-3 py-2 text-sm text-[#7A2E2E]">{importError}</p> : null}

      {cards.length === 0 ? (
        <EmptyArchive />
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-[#CDBFBE] bg-[#FBF8F3]/70 px-5 py-10 text-center">
          <p className="font-mincho text-2xl">合うシートがありません</p>
          <p className="mt-2 text-sm text-[#6d6274]">対戦相手か大会の条件を変えてみてください。</p>
          <button
            type="button"
            className="mt-4 text-sm text-[#5C2D86] underline underline-offset-2"
            onClick={() => {
              setOpponent("")
              setCompetition("all")
            }}
          >
            条件を消す
          </button>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtered.map((card) => (
            <li key={card.id}>
              <ArchiveRow card={card} />
            </li>
          ))}
        </ul>
      )}
      <Dialog open={pendingImport !== null} onOpenChange={(open) => { if (!open) setPendingImport(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>この端末のカードを置き換えます</DialogTitle>
            <DialogDescription>
              読み込んだファイルの内容が、いまのアーカイブの代わりになります。書き出していないカードは消えます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingImport(null)}>
              戻る
            </Button>
            <Button type="button" onClick={() => void confirmImport()}>
              置き換える
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ArchiveRow({ card }: { card: Card }) {
  const board = scoreboard(card)
  const result = resultOf(card.ourScore, card.theirScore)
  return (
    <Link
      href={`/matches/${card.id}`}
      className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 rounded-xl bg-[#FBF8F3] p-3 ring-1 ring-[#3A1458]/10 transition hover:ring-[#5C2D86]/40 sm:grid-cols-[104px_minmax(0,1fr)_128px] sm:p-5"
    >
      <div className="w-[76px] overflow-hidden rounded-md sm:w-[104px]">
        <div className="relative aspect-[68/105]">
          <PitchGraphic
            uid={`mini-${card.id}`}
            players={card.players}
            arrows={card.arrows}
            showNames={false}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={result === "勝" ? "default" : result === "敗" ? "destructive" : "secondary"}>
            {result}
          </Badge>
          <span className="text-xs tracking-wide text-[#6d6274]">{formatDateJa(card.date)}</span>
          <span className="text-xs text-[#6d6274]">{VENUE_LABEL[card.venue]}</span>
          {card.id === SEED_CARD_ID ? <Badge variant="outline">サンプル</Badge> : null}
        </div>
        <p className="mt-2 truncate font-mincho text-2xl">{card.opponent}</p>
        <p className="mt-1 text-sm text-[#5c5462]">
          {card.competition} · {card.formation}
          {card.motm ? ` · MOM ${card.motm}` : ""}
        </p>
      </div>
      <p className="font-mincho text-3xl tabular-nums tracking-tight sm:text-right sm:text-4xl">
        <span className="block truncate text-[10px] tracking-[0.14em] text-[#6d6274] sm:text-right">
          {board.leftName}–{board.rightName}
        </span>
        {board.leftScore}
        <span className="px-1 text-[#C4B6C8]">–</span>
        {board.rightScore}
      </p>
    </Link>
  )
}

function EmptyArchive() {
  return (
    <div className="mt-8 rounded-xl border border-dashed border-[#CDBFBE] bg-[#FBF8F3]/80 px-5 py-12 text-center">
      <p className="font-mincho text-3xl">まだシートがありません</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6d6274]">
        試合が終わったら、相手とスコア、メモ、ピッチ上の配置から一枚作ります。
      </p>
      <Link href="/matches/new" className={cn(buttonVariants({ size: "lg" }), "mt-5 inline-flex h-11 px-4")}>
        最初の試合を書く
      </Link>
    </div>
  )
}
