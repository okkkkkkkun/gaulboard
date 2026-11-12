import { z } from "zod"
import { validateCardInput } from "@/lib/card-logic"
import type { Card } from "@/lib/types"

export const BACKUP_APP = "gaulboard"
export const BACKUP_VERSION = 1

export type BackupFile = {
  app: typeof BACKUP_APP
  version: typeof BACKUP_VERSION
  exportedAt: string
  cards: Card[]
}

const metaSchema = z.object({
  id: z.string().trim().min(1).max(80),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export function parseStoredCard(value: unknown): Card | null {
  if (!value || typeof value !== "object") return null
  const meta = metaSchema.safeParse(value)
  const input = validateCardInput(value)
  if (!meta.success || !input.ok) return null
  return { ...input.data, ...meta.data }
}

export function buildBackup(cards: Card[], exportedAt = new Date().toISOString()): BackupFile {
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt,
    cards,
  }
}

export function backupFilename(when = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(when)
  return `gaulboard-backup-${date}.json`
}

export function parseBackup(
  raw: unknown,
): { ok: true; cards: Card[] } | { ok: false; message: string } {
  let data = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw) as unknown
    } catch {
      return { ok: false, message: "JSONとして読めませんでした。" }
    }
  }

  const envelope = z
    .object({
      app: z.literal(BACKUP_APP),
      version: z.literal(BACKUP_VERSION),
      cards: z.array(z.unknown()),
    })
    .safeParse(data)

  if (!envelope.success) {
    return { ok: false, message: "ガウルボードのバックアップではありません。" }
  }

  const cards: Card[] = []
  for (const [index, value] of envelope.data.cards.entries()) {
    const card = parseStoredCard(value)
    if (!card) {
      return { ok: false, message: `${index + 1}枚目のカードを読めませんでした。` }
    }
    cards.push(card)
  }

  if (new Set(cards.map((card) => card.id)).size !== cards.length) {
    return { ok: false, message: "同じIDのカードが重なっています。" }
  }

  return { ok: true, cards }
}
