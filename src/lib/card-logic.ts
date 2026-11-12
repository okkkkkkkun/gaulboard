import { z } from "zod"
import { isFormationId } from "@/lib/formations"
import type { Arrow, Card, CardDraft, CardInput, Player, Venue } from "@/lib/types"

export const CLUB = "サンフレッチェ広島"
export const CLUB_SHORT = "広島"

export const VENUE_LABEL: Record<Venue, string> = {
  home: "ホーム",
  away: "アウェイ",
}

export const COMPETITIONS = [
  "明治安田J1リーグ",
  "ルヴァンカップ",
  "天皇杯",
  "AFCチャンピオンズリーグエリート",
  "親善試合",
] as const

export const DEFAULT_FORMATION = "3-4-2-1"

const playerSchema = z.object({
  id: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(40),
  number: z.string().trim().max(3),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

const arrowSchema = z
  .object({
    id: z.string().trim().min(1).max(80),
    x1: z.number().min(0).max(100),
    y1: z.number().min(0).max(100),
    x2: z.number().min(0).max(100),
    y2: z.number().min(0).max(100),
    kind: z.enum(["press", "move"]),
  })
  .refine((arrow) => Math.hypot(arrow.x2 - arrow.x1, arrow.y2 - arrow.y1) >= 3, {
    message: "short",
  })

const cardInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  opponent: z.string().trim().min(1).max(60),
  venue: z.enum(["home", "away"]),
  competition: z.string().trim().min(1).max(60),
  ourScore: z.number().int().min(0).max(30),
  theirScore: z.number().int().min(0).max(30),
  memo: z.string().max(8000),
  formation: z.string().trim().min(1).max(20),
  pressingAim: z.string().max(2000),
  buildupPattern: z.string().max(2000),
  keyMoments: z.string().max(4000),
  goodPoints: z.string().max(4000),
  issues: z.string().max(4000),
  motm: z.string().trim().max(40),
  rating: z.number().min(0).max(10).multipleOf(0.5).nullable(),
  players: z.array(playerSchema).length(11),
  arrows: z.array(arrowSchema).max(16),
})

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function snapRating(value: number) {
  return Math.round(clamp(value, 0, 10) * 2) / 2
}

export function validateCardInput(
  input: unknown,
): { ok: true; data: CardInput } | { ok: false; message: string } {
  const parsed = cardInputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, message: validationMessage(parsed.error) }
  }
  if (!isValidDate(parsed.data.date)) {
    return { ok: false, message: "日付を確認してください。" }
  }
  return { ok: true, data: parsed.data }
}

function validationMessage(error: z.ZodError) {
  const issue = error.issues[0]
  const path = issue?.path.join(".") ?? ""
  if (path === "opponent") return "対戦相手を入力してください。"
  if (path === "date") return "日付は YYYY-MM-DD で入力してください。"
  if (path === "competition") return "大会名を入力してください。"
  if (path === "formation") return "フォーメーション名を入力してください。"
  if (path === "ourScore" || path === "theirScore") {
    return "スコアは 0 から 30 の整数にしてください。"
  }
  if (path === "rating") return "評価は 0 から 10、0.5 刻みにしてください。"
  if (path === "memo") return "メモが長すぎます。"
  if (path.startsWith("players")) return "選手は11人、名前は1文字以上にしてください。"
  if (path.startsWith("arrows") || issue?.message === "short") {
    return "矢印が短すぎるか、16本を超えています。"
  }
  return "入力を確認してください。"
}

function isValidDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export function toDraft(card: Card): CardDraft {
  return {
    date: card.date,
    opponent: card.opponent,
    venue: card.venue,
    competition: card.competition,
    ourScore: card.ourScore,
    theirScore: card.theirScore,
    memo: card.memo,
    formation: card.formation,
    pressingAim: card.pressingAim,
    buildupPattern: card.buildupPattern,
    keyMoments: card.keyMoments,
    goodPoints: card.goodPoints,
    issues: card.issues,
    motm: card.motm,
    rating: card.rating,
    players: card.players,
    arrows: card.arrows,
  }
}

export type CardQuery = {
  opponent?: string
  competition?: string
}

export function filterCards<T extends { opponent: string; competition: string }>(
  cards: T[],
  query: CardQuery,
) {
  const opponent = query.opponent?.trim().toLocaleLowerCase("ja") ?? ""
  const competition = query.competition?.trim() ?? ""
  return cards.filter((card) => {
    const opponentOk =
      !opponent || card.opponent.toLocaleLowerCase("ja").includes(opponent)
    const competitionOk = !competition || competition === "all" || card.competition === competition
    return opponentOk && competitionOk
  })
}

export function resultOf(ourScore: number, theirScore: number): "勝" | "分" | "敗" {
  if (ourScore > theirScore) return "勝"
  if (ourScore < theirScore) return "敗"
  return "分"
}

export function scoreboard(card: Pick<CardInput, "venue" | "opponent" | "ourScore" | "theirScore">) {
  if (card.venue === "home") {
    return {
      leftName: CLUB_SHORT,
      leftScore: card.ourScore,
      rightName: card.opponent,
      rightScore: card.theirScore,
    }
  }
  return {
    leftName: card.opponent,
    leftScore: card.theirScore,
    rightName: CLUB_SHORT,
    rightScore: card.ourScore,
  }
}

export function formatDateJa(iso: string) {
  const [year, month, day] = iso.split("-")
  if (!year || !month || !day) return iso
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const weekday = "日月火水木金土"[date.getUTCDay()]
  return `${year}.${month}.${day}（${weekday}）`
}

export function sheetCode(card: Pick<Card, "date" | "id">) {
  return `GB-${card.date.replaceAll("-", "")}`
}

export function downloadName(card: Pick<CardInput, "date" | "opponent">) {
  const opponent = card.opponent.replace(/[\\/:*?"<>|\s]+/g, "_").replace(/_+/g, "_")
  return `gaulboard_${card.date}_${opponent || "match"}.png`
}

export function competitionOptions(cards: { competition: string }[]) {
  const seen = new Set<string>(COMPETITIONS)
  for (const card of cards) {
    if (card.competition.trim()) seen.add(card.competition.trim())
  }
  return [...seen]
}

export function hasTacticalText(draft: CardDraft) {
  return [
    draft.pressingAim,
    draft.buildupPattern,
    draft.keyMoments,
    draft.goodPoints,
    draft.issues,
    draft.motm,
  ].some((value) => value.trim().length > 0) || draft.rating !== null
}

export function knownFormationOrNull(value: string | null | undefined) {
  if (!value || !isFormationId(value)) return null
  return value
}

export function parseStoredPlayers(json: string): Player[] {
  const parsed = playerSchema.array().length(11).safeParse(JSON.parse(json))
  if (!parsed.success) {
    throw new Error("保存された選手配置を読めませんでした。")
  }
  return parsed.data
}

export function parseStoredArrows(json: string): Arrow[] {
  const parsed = arrowSchema.array().max(16).safeParse(JSON.parse(json))
  if (!parsed.success) {
    throw new Error("保存された矢印を読めませんでした。")
  }
  return parsed.data
}
