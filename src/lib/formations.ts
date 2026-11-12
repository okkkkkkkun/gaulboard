import type { Player } from "@/lib/types"

export const FORMATION_IDS = [
  "3-4-2-1",
  "4-4-2",
  "3-5-2",
  "4-2-3-1",
  "4-3-3",
  "4-1-4-1",
] as const

export type FormationId = (typeof FORMATION_IDS)[number]

export type Slot = {
  role: string
  x: number
  y: number
}

const FORMATIONS: Record<FormationId, Slot[]> = {
  "3-4-2-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "左CB", x: 28, y: 74 },
    { role: "CB", x: 50, y: 78 },
    { role: "右CB", x: 72, y: 74 },
    { role: "左WB", x: 12, y: 52 },
    { role: "左IH", x: 36, y: 54 },
    { role: "右IH", x: 64, y: 54 },
    { role: "右WB", x: 88, y: 52 },
    { role: "左SH", x: 36, y: 32 },
    { role: "右SH", x: 64, y: 32 },
    { role: "CF", x: 50, y: 15 },
  ],
  "4-4-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "左SB", x: 14, y: 74 },
    { role: "左CB", x: 36, y: 77 },
    { role: "右CB", x: 64, y: 77 },
    { role: "右SB", x: 86, y: 74 },
    { role: "左SH", x: 14, y: 48 },
    { role: "左IH", x: 38, y: 52 },
    { role: "右IH", x: 62, y: 52 },
    { role: "右SH", x: 86, y: 48 },
    { role: "左CF", x: 38, y: 20 },
    { role: "右CF", x: 62, y: 20 },
  ],
  "3-5-2": [
    { role: "GK", x: 50, y: 90 },
    { role: "左CB", x: 28, y: 74 },
    { role: "CB", x: 50, y: 78 },
    { role: "右CB", x: 72, y: 74 },
    { role: "左WB", x: 10, y: 48 },
    { role: "左IH", x: 30, y: 54 },
    { role: "アンカー", x: 50, y: 44 },
    { role: "右IH", x: 70, y: 54 },
    { role: "右WB", x: 90, y: 48 },
    { role: "左CF", x: 38, y: 18 },
    { role: "右CF", x: 62, y: 18 },
  ],
  "4-2-3-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "左SB", x: 14, y: 72 },
    { role: "左CB", x: 36, y: 76 },
    { role: "右CB", x: 64, y: 76 },
    { role: "右SB", x: 86, y: 72 },
    { role: "左IH", x: 38, y: 56 },
    { role: "右IH", x: 62, y: 56 },
    { role: "左WG", x: 18, y: 36 },
    { role: "トップ下", x: 50, y: 34 },
    { role: "右WG", x: 82, y: 36 },
    { role: "CF", x: 50, y: 16 },
  ],
  "4-3-3": [
    { role: "GK", x: 50, y: 90 },
    { role: "左SB", x: 14, y: 74 },
    { role: "左CB", x: 36, y: 77 },
    { role: "右CB", x: 64, y: 77 },
    { role: "右SB", x: 86, y: 74 },
    { role: "左IH", x: 30, y: 50 },
    { role: "アンカー", x: 50, y: 58 },
    { role: "右IH", x: 70, y: 50 },
    { role: "左WG", x: 18, y: 22 },
    { role: "CF", x: 50, y: 16 },
    { role: "右WG", x: 82, y: 22 },
  ],
  "4-1-4-1": [
    { role: "GK", x: 50, y: 90 },
    { role: "左SB", x: 14, y: 74 },
    { role: "左CB", x: 36, y: 77 },
    { role: "右CB", x: 64, y: 77 },
    { role: "右SB", x: 86, y: 74 },
    { role: "アンカー", x: 50, y: 58 },
    { role: "左SH", x: 14, y: 40 },
    { role: "左IH", x: 36, y: 42 },
    { role: "右IH", x: 64, y: 42 },
    { role: "右SH", x: 86, y: 40 },
    { role: "CF", x: 50, y: 16 },
  ],
}

const ROLE_NAMES = new Set(
  Object.values(FORMATIONS).flatMap((slots) => slots.map((slot) => slot.role)),
)

export function isFormationId(value: string): value is FormationId {
  return (FORMATION_IDS as readonly string[]).includes(value)
}

export function slotsOf(formationId: string): Slot[] | null {
  if (!isFormationId(formationId)) return null
  return FORMATIONS[formationId]
}

export function createPlayers(formationId: string): Player[] {
  const slots = slotsOf(formationId) ?? FORMATIONS["4-2-3-1"]
  return slots.map((slot, index) => ({
    id: `player-${index + 1}`,
    name: slot.role,
    number: "",
    x: slot.x,
    y: slot.y,
  }))
}

export function reseatPlayers(players: Player[], formationId: string): Player[] {
  const slots = slotsOf(formationId)
  if (!slots) return players
  return slots.map((slot, index) => {
    const prev = players[index]
    const previousName = prev?.name?.trim() ?? ""
    const name =
      previousName && !ROLE_NAMES.has(previousName) ? previousName : slot.role
    return {
      id: prev?.id ?? `player-${index + 1}`,
      name,
      number: prev?.number ?? "",
      x: slot.x,
      y: slot.y,
    }
  })
}
