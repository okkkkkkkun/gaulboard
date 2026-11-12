import fs from "node:fs"
import path from "node:path"
import Database from "better-sqlite3"
import { parseStoredArrows, parseStoredPlayers, snapRating } from "@/lib/card-logic"
import { seedCard } from "@/lib/seed"
import type { Card, CardInput } from "@/lib/types"

const SCHEMA = `
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  opponent TEXT NOT NULL,
  venue TEXT NOT NULL CHECK (venue IN ('home', 'away')),
  competition TEXT NOT NULL,
  our_score INTEGER NOT NULL,
  their_score INTEGER NOT NULL,
  memo TEXT NOT NULL,
  formation TEXT NOT NULL,
  pressing_aim TEXT NOT NULL,
  buildup_pattern TEXT NOT NULL,
  key_moments TEXT NOT NULL,
  good_points TEXT NOT NULL,
  issues TEXT NOT NULL,
  motm TEXT NOT NULL,
  rating REAL,
  players_json TEXT NOT NULL,
  arrows_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cards_date ON cards (date DESC, created_at DESC);
`

type CardRow = {
  id: string
  date: string
  opponent: string
  venue: "home" | "away"
  competition: string
  our_score: number
  their_score: number
  memo: string
  formation: string
  pressing_aim: string
  buildup_pattern: string
  key_moments: string
  good_points: string
  issues: string
  motm: string
  rating: number | null
  players_json: string
  arrows_json: string
  created_at: string
  updated_at: string
}

const globalForDb = globalThis as unknown as { __gaulDb?: Database.Database }

export function openDatabase(filename: string) {
  if (filename !== ":memory:") {
    fs.mkdirSync(path.dirname(filename), { recursive: true })
  }
  const db = new Database(filename)
  db.pragma("foreign_keys = ON")
  if (filename !== ":memory:") db.pragma("journal_mode = WAL")
  db.exec(SCHEMA)
  seedIfEmpty(db)
  return db
}

export function getDb() {
  if (!globalForDb.__gaulDb) {
    const filename =
      process.env.GAULBOARD_DB ?? path.join(process.cwd(), "data", "gaulboard.sqlite")
    globalForDb.__gaulDb = openDatabase(filename)
  }
  return globalForDb.__gaulDb
}

export function seedIfEmpty(db: Database.Database) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM cards").get() as { count: number }
  if (row.count > 0) return
  insertCard(db, seedCard(), { id: seedCard().id, createdAt: seedCard().createdAt })
}

export function listCards(db: Database.Database = getDb()) {
  const rows = db
    .prepare("SELECT * FROM cards ORDER BY date DESC, created_at DESC")
    .all() as CardRow[]
  return rows.map(rowToCard)
}

export function getCard(db: Database.Database, id: string) {
  const row = db.prepare("SELECT * FROM cards WHERE id = ?").get(id) as CardRow | undefined
  return row ? rowToCard(row) : null
}

export function insertCard(
  db: Database.Database,
  input: CardInput,
  options?: { id?: string; createdAt?: string },
) {
  const id = options?.id ?? crypto.randomUUID()
  const now = new Date().toISOString()
  const createdAt = options?.createdAt ?? now
  db.prepare(
    `INSERT INTO cards (
      id, date, opponent, venue, competition, our_score, their_score, memo, formation,
      pressing_aim, buildup_pattern, key_moments, good_points, issues, motm, rating,
      players_json, arrows_json, created_at, updated_at
    ) VALUES (
      @id, @date, @opponent, @venue, @competition, @our_score, @their_score, @memo, @formation,
      @pressing_aim, @buildup_pattern, @key_moments, @good_points, @issues, @motm, @rating,
      @players_json, @arrows_json, @created_at, @updated_at
    )`,
  ).run(toParams(id, input, createdAt, createdAt))
  const card = getCard(db, id)
  if (!card) throw new Error("保存したカードを読み直せませんでした。")
  return card
}

export function updateCard(db: Database.Database, id: string, input: CardInput) {
  const existing = getCard(db, id)
  if (!existing) return null
  const updatedAt = new Date().toISOString()
  db.prepare(
    `UPDATE cards SET
      date = @date,
      opponent = @opponent,
      venue = @venue,
      competition = @competition,
      our_score = @our_score,
      their_score = @their_score,
      memo = @memo,
      formation = @formation,
      pressing_aim = @pressing_aim,
      buildup_pattern = @buildup_pattern,
      key_moments = @key_moments,
      good_points = @good_points,
      issues = @issues,
      motm = @motm,
      rating = @rating,
      players_json = @players_json,
      arrows_json = @arrows_json,
      updated_at = @updated_at
    WHERE id = @id`,
  ).run(toParams(id, input, existing.createdAt, updatedAt))
  return getCard(db, id)
}

export function deleteCard(db: Database.Database, id: string) {
  const result = db.prepare("DELETE FROM cards WHERE id = ?").run(id)
  return result.changes > 0
}

function toParams(id: string, input: CardInput, createdAt: string, updatedAt: string) {
  return {
    id,
    date: input.date,
    opponent: input.opponent,
    venue: input.venue,
    competition: input.competition,
    our_score: input.ourScore,
    their_score: input.theirScore,
    memo: input.memo,
    formation: input.formation,
    pressing_aim: input.pressingAim,
    buildup_pattern: input.buildupPattern,
    key_moments: input.keyMoments,
    good_points: input.goodPoints,
    issues: input.issues,
    motm: input.motm,
    rating: input.rating,
    players_json: JSON.stringify(input.players),
    arrows_json: JSON.stringify(input.arrows),
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

function rowToCard(row: CardRow): Card {
  return {
    id: row.id,
    date: row.date,
    opponent: row.opponent,
    venue: row.venue,
    competition: row.competition,
    ourScore: row.our_score,
    theirScore: row.their_score,
    memo: row.memo,
    formation: row.formation,
    pressingAim: row.pressing_aim,
    buildupPattern: row.buildup_pattern,
    keyMoments: row.key_moments,
    goodPoints: row.good_points,
    issues: row.issues,
    motm: row.motm,
    rating: row.rating === null ? null : snapRating(row.rating),
    players: parseStoredPlayers(row.players_json),
    arrows: parseStoredArrows(row.arrows_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
