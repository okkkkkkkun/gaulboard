"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { PitchGraphic } from "@/components/pitch-graphic"
import { Badge } from "@/components/ui/badge"
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
import { SEED_CARD_ID } from "@/lib/seed"
import { cn } from "cn"
import type { Card } from "@/lib/types"

export function ArchiveScreen({ cards }: { cards: Card[] }) {
  const [opponent, setOpponent] = useState("")
  const [competition, setCompetition] = useState("all")
  const options = useMemo(() => competitionOptions(cards), [cards])
  const competitionItems = useMemo(
    () => [{ value: "all", label: "すべての大会" }, ...options.map((option) => ({ value: option, label: option }))],
    [options],
  )
  const filtered = filterCards(cards, { opponent, competition })

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div>
        <p className="text-[11px] tracking-[0.18em] text-[#5C2D86]">ARCHIVE</p>
        <h1 className="font-mincho text-3xl text-[#24142F] sm:text-4xl">試合のシート</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5c5462]">
          終わった試合のメモと配置を、一枚のカードにして残します。
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px_auto] sm:items-center">
        <Input
          value={opponent}
          placeholder="対戦相手で探す"
          aria-label="対戦相手で探す"
          onChange={(event) => setOpponent(event.target.value)}
        />
        <Select
          items={competitionItems}
          value={competition}
          onValueChange={(value) => setCompetition(value ?? "all")}
        >
          <SelectTrigger className="w-full" aria-label="大会で絞り込む">
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
    </div>
  )
}

function ArchiveRow({ card }: { card: Card }) {
  const board = scoreboard(card)
  const result = resultOf(card.ourScore, card.theirScore)
  return (
    <Link
      href={`/matches/${card.id}`}
      className="grid gap-4 rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10 transition hover:-translate-y-0.5 hover:ring-[#5C2D86]/40 sm:grid-cols-[104px_minmax(0,1fr)_128px] sm:p-5"
    >
      <div className="hidden w-[104px] overflow-hidden rounded-md sm:block">
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
