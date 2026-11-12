import { describe, expect, it } from "vitest"
import { buildBackup, parseBackup, parseStoredCard } from "@/lib/backup"
import { toDraft } from "@/lib/card-logic"
import { seedCard } from "@/lib/seed"
import { blankDraft } from "@/lib/draft"

describe("backup json", () => {
  it("round-trips the sample card", () => {
    const backup = buildBackup([seedCard()], "2026-11-12T00:00:00.000Z")
    const parsed = parseBackup(JSON.stringify(backup))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.cards).toEqual([seedCard()])
  })

  it("rejects a foreign file, a broken card, and duplicate ids", () => {
    expect(parseBackup("{").ok).toBe(false)
    expect(parseBackup({ app: "other", version: 1, cards: [] }).ok).toBe(false)
    const broken = buildBackup([seedCard()])
    broken.cards[0] = { ...broken.cards[0], opponent: "" }
    expect(parseBackup(broken).ok).toBe(false)
    const duplicated = buildBackup([seedCard(), seedCard()])
    const duplicateResult = parseBackup(duplicated)
    expect(duplicateResult.ok).toBe(false)
  })

  it("keeps timestamps when the card fields are valid", () => {
    const card = {
      ...blankDraft(new Date("2026-11-01T00:00:00.000Z")),
      opponent: "ヴィッセル神戸",
      id: "card-kobe",
      createdAt: "2026-11-01T10:00:00.000Z",
      updatedAt: "2026-11-01T12:00:00.000Z",
    }
    expect(parseStoredCard(card)?.id).toBe("card-kobe")
    expect(toDraft(seedCard()).opponent).toContain("町田")
  })
})
