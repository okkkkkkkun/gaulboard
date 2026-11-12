export const VENUES = ["home", "away"] as const

export type Venue = (typeof VENUES)[number]

export const ARROW_KINDS = ["press", "move"] as const

export type ArrowKind = (typeof ARROW_KINDS)[number]

export type Player = {
  id: string
  name: string
  number: string
  x: number
  y: number
}

export type Arrow = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  kind: ArrowKind
}

export type CardInput = {
  date: string
  opponent: string
  venue: Venue
  competition: string
  ourScore: number
  theirScore: number
  memo: string
  formation: string
  pressingAim: string
  buildupPattern: string
  keyMoments: string
  goodPoints: string
  issues: string
  motm: string
  rating: number | null
  players: Player[]
  arrows: Arrow[]
}

export type Card = CardInput & {
  id: string
  createdAt: string
  updatedAt: string
}

export type CardDraft = CardInput
