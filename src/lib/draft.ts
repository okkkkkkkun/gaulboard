import { DEFAULT_FORMATION, COMPETITIONS } from "@/lib/card-logic"
import { createPlayers } from "@/lib/formations"
import type { CardDraft } from "@/lib/types"

export function blankDraft(now = new Date()): CardDraft {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
  return {
    date,
    opponent: "",
    venue: "home",
    competition: COMPETITIONS[0],
    ourScore: 0,
    theirScore: 0,
    memo: "",
    formation: DEFAULT_FORMATION,
    pressingAim: "",
    buildupPattern: "",
    keyMoments: "",
    goodPoints: "",
    issues: "",
    motm: "",
    rating: null,
    players: createPlayers(DEFAULT_FORMATION),
    arrows: [],
  }
}
