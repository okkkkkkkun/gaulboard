import { PitchGraphic } from "@/components/pitch-graphic"
import { Mark } from "@/components/mark"
import {
  CLUB,
  formatDateJa,
  resultOf,
  scoreboard,
  sheetCode,
  VENUE_LABEL,
} from "@/lib/card-logic"
import type { Card } from "@/lib/types"

export function TacticalCard({ card }: { card: Card }) {
  const board = scoreboard(card)
  const result = resultOf(card.ourScore, card.theirScore)
  return (
    <article className="relative overflow-hidden bg-[#FBF8F3] text-[#24142F] shadow-[0_30px_70px_-36px_rgba(58,20,88,0.55)] ring-1 ring-[#3A1458]/12">
      <header className="bg-[#3A1458] px-5 py-5 text-[#F6F1E8] sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Mark light />
            <div>
              <p className="text-[10px] tracking-[0.22em] text-white/60">GAULBOARD</p>
              <p className="font-mincho text-xl leading-tight">戦術カード</p>
            </div>
          </div>
          <p className="text-right text-[11px] leading-relaxed tracking-[0.08em] text-white/70">
            {sheetCode(card)}
            <br />
            {formatDateJa(card.date)}
          </p>
        </div>
        <p className="mt-6 text-[11px] tracking-[0.18em] text-white/60">
          {card.competition} · {VENUE_LABEL[card.venue]}
        </p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <p className="font-mincho text-lg leading-snug sm:text-2xl">{board.leftName}</p>
          <p className="font-mincho text-4xl tabular-nums tracking-tight sm:text-6xl">
            {board.leftScore}
            <span className="px-1 text-white/40 sm:px-2">–</span>
            {board.rightScore}
          </p>
          <p className="text-right font-mincho text-lg leading-snug sm:text-2xl">{board.rightName}</p>
        </div>
        <p className="mt-3 text-xs tracking-[0.16em] text-[#E2B657]">{result} · {CLUB}</p>
      </header>

      <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div className="min-w-0">
          <PitchGraphic uid={`card-${card.id}`} players={card.players} arrows={card.arrows} />
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#6d6274]">
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-3 w-6 rounded-sm bg-[#1C7A4E] shadow-[inset_0_0_0_1px_rgba(226,182,87,0.9)]" />
              金色の矢印はプレス
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="inline-block h-3 w-6 rounded-sm bg-[#1C7A4E] shadow-[inset_0_-2px_0_rgba(247,243,236,0.95)]" />
              白い矢印は動き
            </span>
          </div>
          <ol className="mt-3 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] leading-5">
            {card.players.map((player) => (
              <li key={player.id} className="flex min-w-0 gap-1.5">
                <span className="w-5 shrink-0 tabular-nums text-[#5C2D86]">{player.number || "–"}</span>
                <span className="truncate">{player.name}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0 space-y-4">
          <Note label="フォーメーション">{card.formation}</Note>
          <Note label="プレッシング">{card.pressingAim}</Note>
          <Note label="ビルドアップ">{card.buildupPattern}</Note>
          <Note label="キーモーメント">{card.keyMoments}</Note>
        </div>
      </div>

      <div className="grid gap-5 border-t border-[#E7DDD0] px-5 py-5 sm:px-7 md:grid-cols-2">
        <Note label="良かった点">{card.goodPoints}</Note>
        <Note label="課題">{card.issues}</Note>
      </div>

      <div className="grid gap-4 border-t border-[#E7DDD0] px-5 py-5 sm:grid-cols-[1fr_180px] sm:px-7">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">マン・オブ・ザ・マッチ</p>
          <p className="mt-1 font-mincho text-2xl">{card.motm.trim() || "—"}</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">評価</p>
          <p className="mt-1 font-mincho text-2xl tabular-nums">
            {card.rating === null ? "—" : card.rating.toFixed(1)}
            <span className="ml-1 text-sm text-[#6d6274]">/ 10</span>
          </p>
          <div className="mt-2 h-1.5 bg-[#EFE8DC]">
            <div
              className="h-full bg-[#5C2D86]"
              style={{ width: `${((card.rating ?? 0) / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {card.memo.trim() ? (
        <div className="border-t border-[#E7DDD0] px-5 py-5 sm:px-7">
          <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">試合後メモ</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{card.memo}</p>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-[#E7DDD0] px-5 py-3 text-[10px] tracking-[0.16em] text-[#6d6274] sm:px-7">
        <span>非公式 · ファンのシート</span>
        <span>SANFRECCE HIROSHIMA</span>
      </footer>
    </article>
  )
}

function Note({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{children.trim() || "—"}</p>
    </div>
  )
}
