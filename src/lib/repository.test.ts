import "fake-indexeddb/auto"
import { describe, expect, it } from "vitest"
import { toDraft } from "@/lib/card-logic"
import { blankDraft } from "@/lib/draft"
import {
  createGaulDb,
  exportArchiveJson,
  importArchiveJson,
  persistCard,
  readCard,
  readCards,
  removeStoredCard,
} from "@/lib/repository"
import { SEED_CARD_ID } from "@/lib/seed"

describe("indexeddb archive", () => {
  it("seeds Machida once, then keeps an emptied archive empty", async () => {
    const db = createGaulDb(`gaul-seed-${crypto.randomUUID()}`)
    const first = await readCards(db)
    expect(first.map((card) => card.id)).toEqual([SEED_CARD_ID])
    expect(first[0]?.opponent).toContain("町田")
    expect(first[0]?.venue).toBe("away")
    expect(first[0]?.ourScore).toBe(0)
    expect(first[0]?.theirScore).toBe(0)

    expect(await removeStoredCard(SEED_CARD_ID, db)).toBe(true)
    expect(await readCards(db)).toEqual([])
    expect(await readCards(db)).toEqual([])
    db.close()
  })

  it("saves, updates, exports, and replaces the archive from json", async () => {
    const db = createGaulDb(`gaul-io-${crypto.randomUUID()}`)
    const created = await persistCard(
      null,
      { ...blankDraft(new Date("2026-12-01T00:00:00.000Z")), opponent: "セレッソ大阪", ourScore: 2, theirScore: 1 },
      db,
    )
    expect(created?.opponent).toBe("セレッソ大阪")
    const updated = await persistCard(created!.id, { ...toDraft(created!), opponent: "テストFC" }, db)
    expect(updated?.opponent).toBe("テストFC")
    expect((await readCard(created!.id, db))?.opponent).toBe("テストFC")
    expect((await readCards(db)).map((card) => card.id)[0]).toBe(created!.id)

    const json = await exportArchiveJson(db)
    const other = createGaulDb(`gaul-import-${crypto.randomUUID()}`)
    const imported = await importArchiveJson(json, other)
    expect(imported.ok).toBe(true)
    if (!imported.ok) return
    expect(imported.count).toBe(2)
    expect((await readCards(other)).map((card) => card.opponent)).toContain("テストFC")

    const rejected = await importArchiveJson("{", other)
    expect(rejected.ok).toBe(false)
    expect(await readCards(other)).toHaveLength(2)
    db.close()
    other.close()
  })
})
