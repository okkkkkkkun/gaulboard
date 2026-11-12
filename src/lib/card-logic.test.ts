import { describe, expect, it } from "vitest"
import { createPlayers, reseatPlayers } from "@/lib/formations"
import {
  downloadName,
  filterCards,
  formatDateJa,
  resultOf,
  scoreboard,
  snapRating,
  toDraft,
  validateCardInput,
} from "@/lib/card-logic"
import { seedCard } from "@/lib/seed"
import { blankDraft } from "@/lib/draft"

describe("formations", () => {
  it("puts eleven players on the pitch for every preset", () => {
    for (const id of ["3-4-2-1", "4-4-2", "3-5-2", "4-2-3-1", "4-3-3", "4-1-4-1"]) {
      const players = createPlayers(id)
      expect(players).toHaveLength(11)
      for (const player of players) {
        expect(player.x).toBeGreaterThanOrEqual(0)
        expect(player.x).toBeLessThanOrEqual(100)
        expect(player.y).toBeGreaterThanOrEqual(0)
        expect(player.y).toBeLessThanOrEqual(100)
      }
      expect(new Set(players.map((player) => `${player.x},${player.y}`)).size).toBe(11)
    }
  })

  it("keeps real names and replaces role placeholders when the shape changes", () => {
    const named = createPlayers("4-2-3-1").map((player, index) =>
      index === 0 ? { ...player, name: "大迫敬介", number: "1" } : player,
    )
    const moved = reseatPlayers(named, "3-4-2-1")
    expect(moved[0]?.name).toBe("大迫敬介")
    expect(moved[0]?.number).toBe("1")
    expect(moved[4]?.name).toBe("左WB")
    expect(moved[0]?.y).toBeGreaterThan(moved[10]?.y ?? 0)
  })
})

describe("card logic", () => {
  it("accepts the seeded match", () => {
    const parsed = validateCardInput(toDraft(seedCard()))
    expect(parsed.ok).toBe(true)
  })

  it("rejects an empty opponent, a bad score, and a short arrow", () => {
    const draft = blankDraft(new Date("2026-11-12T00:00:00Z"))
    expect(validateCardInput({ ...draft, opponent: "  " }).ok).toBe(false)
    expect(validateCardInput({ ...draft, opponent: "浦和", ourScore: 1.5 }).ok).toBe(false)
    expect(validateCardInput({ ...draft, opponent: "浦和", date: "2026-02-31" }).ok).toBe(false)
    expect(
      validateCardInput({
        ...draft,
        opponent: "浦和",
        arrows: [{ id: "a", x1: 10, y1: 10, x2: 11, y2: 10, kind: "press" }],
      }).ok,
    ).toBe(false)
  })

  it("filters by opponent and competition", () => {
    const cards = [
      { opponent: "FC町田ゼルビア", competition: "明治安田J1リーグ" },
      { opponent: "清水エスパルス", competition: "天皇杯" },
    ]
    expect(filterCards(cards, { opponent: "町田" })).toHaveLength(1)
    expect(filterCards(cards, { opponent: "  エスパルス " })[0]?.competition).toBe("天皇杯")
    expect(filterCards(cards, { competition: "天皇杯" })).toHaveLength(1)
    expect(filterCards(cards, { opponent: "町田", competition: "天皇杯" })).toHaveLength(0)
  })

  it("formats the score from Hiroshima's side of the ground", () => {
    expect(resultOf(2, 1)).toBe("勝")
    expect(resultOf(0, 0)).toBe("分")
    expect(resultOf(0, 1)).toBe("敗")
    expect(scoreboard({ venue: "away", opponent: "FC町田ゼルビア", ourScore: 0, theirScore: 0 })).toEqual({
      leftName: "FC町田ゼルビア",
      leftScore: 0,
      rightName: "広島",
      rightScore: 0,
    })
    expect(formatDateJa("2026-11-08")).toBe("2026.11.08（日）")
    expect(snapRating(6.2)).toBe(6)
    expect(snapRating(11)).toBe(10)
    expect(downloadName({ date: "2026-11-08", opponent: "FC町田ゼルビア" })).toBe(
      "gaulboard_2026-11-08_FC町田ゼルビア.png",
    )
  })
})
