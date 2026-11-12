import Dexie, { type Table } from "dexie"
import { buildBackup, parseBackup } from "@/lib/backup"
import { seedCard } from "@/lib/seed"
import type { Card, CardInput } from "@/lib/types"

type MetaRow = {
  key: string
  value: string
}

export class GaulDatabase extends Dexie {
  cards!: Table<Card, string>
  meta!: Table<MetaRow, string>

  constructor(name: string) {
    super(name)
    this.version(1).stores({
      cards: "id, date, opponent, competition, updatedAt",
      meta: "key",
    })
  }
}

let singleton: GaulDatabase | null = null

export function createGaulDb(name = "gaulboard") {
  return new GaulDatabase(name)
}

export function getGaulDb() {
  if (!singleton) singleton = createGaulDb()
  return singleton
}

export async function ensureSeed(db: GaulDatabase) {
  await db.transaction("rw", db.cards, db.meta, async () => {
    const flag = await db.meta.get("seeded")
    if (flag?.value === "yes") return
    const count = await db.cards.count()
    if (count === 0) await db.cards.add(seedCard())
    await db.meta.put({ key: "seeded", value: "yes" })
  })
}

export function sortCards(cards: Card[]) {
  return [...cards].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  )
}

export async function readCards(db: GaulDatabase = getGaulDb()) {
  await ensureSeed(db)
  return sortCards(await db.cards.toArray())
}

export async function readCard(id: string, db: GaulDatabase = getGaulDb()) {
  await ensureSeed(db)
  return (await db.cards.get(id)) ?? null
}

export async function persistCard(id: string | null, input: CardInput, db: GaulDatabase = getGaulDb()) {
  await ensureSeed(db)
  const now = new Date().toISOString()
  if (id) {
    const existing = await db.cards.get(id)
    if (!existing) return null
    const card: Card = { ...input, id, createdAt: existing.createdAt, updatedAt: now }
    await db.cards.put(card)
    return card
  }
  const card: Card = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  }
  await db.cards.add(card)
  return card
}

export async function removeStoredCard(id: string, db: GaulDatabase = getGaulDb()) {
  await ensureSeed(db)
  const existing = await db.cards.get(id)
  if (!existing) return false
  await db.cards.delete(id)
  return true
}

export async function replaceArchive(cards: Card[], db: GaulDatabase = getGaulDb()) {
  await db.transaction("rw", db.cards, db.meta, async () => {
    await db.cards.clear()
    if (cards.length > 0) await db.cards.bulkAdd(cards)
    await db.meta.put({ key: "seeded", value: "yes" })
  })
}

export async function exportArchiveJson(db: GaulDatabase = getGaulDb()) {
  const cards = await readCards(db)
  return JSON.stringify(buildBackup(cards), null, 2)
}

export async function importArchiveJson(raw: string, db: GaulDatabase = getGaulDb()) {
  const parsed = parseBackup(raw)
  if (!parsed.ok) return parsed
  await replaceArchive(parsed.cards, db)
  return { ok: true as const, count: parsed.cards.length }
}
