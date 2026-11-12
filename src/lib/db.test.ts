import { describe, expect, it } from "vitest"
import { toDraft } from "@/lib/card-logic"
import { deleteCard, getCard, insertCard, listCards, openDatabase, updateCard } from "@/lib/db"
import { SEED_CARD_ID } from "@/lib/seed"
import { blankDraft } from "@/lib/draft"

describe("sqlite archive", () => {
  it("seeds one match, updates it, and does not restore a deleted archive", () => {
    const db = openDatabase(":memory:")
    const seeded = listCards(db)
    expect(seeded.map((card) => card.id)).toEqual([SEED_CARD_ID])
    expect(seeded[0]?.players).toHaveLength(11)
    expect(seeded[0]?.opponent).toContain("町田")

    const updated = updateCard(db, SEED_CARD_ID, { ...toDraft(seeded[0]!), opponent: "テストFC" })
    expect(updated?.opponent).toBe("テストFC")
    expect(getCard(db, SEED_CARD_ID)?.opponent).toBe("テストFC")

    const draft = blankDraft(new Date("2026-12-01T00:00:00Z"))
    const created = insertCard(db, { ...draft, opponent: "セレッソ大阪", ourScore: 2, theirScore: 1 })
    expect(listCards(db).map((card) => card.id)).toEqual([created.id, SEED_CARD_ID])

    expect(deleteCard(db, SEED_CARD_ID)).toBe(true)
    expect(listCards(db)).toHaveLength(1)
    expect(listCards(db)[0]?.id).not.toBe(SEED_CARD_ID)
  })
})
