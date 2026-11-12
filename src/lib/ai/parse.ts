import { z } from "zod"
import { knownFormationOrNull, snapRating } from "@/lib/card-logic"

export type TacticalSuggestion = {
  formation: string | null
  pressingAim: string
  buildupPattern: string
  keyMoments: string
  goodPoints: string
  issues: string
  motm: string
  rating: number | null
}

const suggestionSchema = z.object({
  formation: z.string().nullable().optional(),
  pressingAim: z.string().optional().default(""),
  buildupPattern: z.string().optional().default(""),
  keyMoments: z.string().optional().default(""),
  goodPoints: z.string().optional().default(""),
  issues: z.string().optional().default(""),
  motm: z.string().optional().default(""),
  rating: z.number().nullable().optional(),
})

export function extractJson(text: string): unknown {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  return JSON.parse(fenced ? fenced[1] : trimmed)
}

export function parseTacticalSuggestion(raw: unknown): TacticalSuggestion {
  const parsed = suggestionSchema.parse(raw)
  const rating =
    parsed.rating === null || parsed.rating === undefined ? null : snapRating(parsed.rating)
  return {
    formation: knownFormationOrNull(parsed.formation),
    pressingAim: clip(parsed.pressingAim, 2000),
    buildupPattern: clip(parsed.buildupPattern, 2000),
    keyMoments: clip(parsed.keyMoments, 4000),
    goodPoints: clip(parsed.goodPoints, 4000),
    issues: clip(parsed.issues, 4000),
    motm: clip(parsed.motm.trim(), 40),
    rating,
  }
}

function clip(value: string, max: number) {
  return value.trim().slice(0, max)
}

export const TACTICAL_SYSTEM_PROMPT = `あなたはサンフレッチェ広島の試合を見るファンのための戦術メモ編集者です。
試合後メモから、戦術カードの欄を日本語で下書きします。
メモにない事実は創作しない。足りない欄は空文字、評価は null。推測するときは文頭を「推測:」にする。
評価を付けるときは 0 から 10 の 0.5 刻み。マン・オブ・ザ・マッチはメモにある選手名だけ。
フォーメーションはメモから読み取れるときだけ、次のいずれか: 3-4-2-1, 4-4-2, 3-5-2, 4-2-3-1, 4-3-3, 4-1-4-1。読み取れなければ null。
次のキーだけを持つ JSON を返す: formation, pressingAim, buildupPattern, keyMoments, goodPoints, issues, motm, rating。`
