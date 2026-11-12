import { slotsOf } from "@/lib/formations"
import type { Arrow, Card, Player } from "@/lib/types"

export const SEED_CARD_ID = "seed-machida-20261108"

const NAMES: { name: string; number: string }[] = [
  { name: "大迫敬介", number: "1" },
  { name: "中野就斗", number: "15" },
  { name: "キムジュソン", number: "37" },
  { name: "荒木隼人", number: "4" },
  { name: "新井直人", number: "5" },
  { name: "川辺駿", number: "6" },
  { name: "中島洋太朗", number: "35" },
  { name: "東俊希", number: "7" },
  { name: "鈴木章斗", number: "10" },
  { name: "浅野拓磨", number: "29" },
  { name: "鮎川峻", number: "23" },
]

function seedPlayers(): Player[] {
  const slots = slotsOf("4-2-3-1")
  if (!slots) throw new Error("4-2-3-1 がありません。")
  return slots.map((slot, index) => ({
    id: `player-${index + 1}`,
    name: NAMES[index].name,
    number: NAMES[index].number,
    x: slot.x,
    y: slot.y,
  }))
}

const seedArrows: Arrow[] = [
  { id: "arrow-1", x1: 38, y1: 56, x2: 46, y2: 28, kind: "press" },
  { id: "arrow-2", x1: 18, y1: 36, x2: 34, y2: 26, kind: "move" },
  { id: "arrow-3", x1: 82, y1: 36, x2: 62, y2: 22, kind: "move" },
]

export function seedCard(): Card {
  return {
    id: SEED_CARD_ID,
    date: "2026-11-08",
    opponent: "FC町田ゼルビア",
    venue: "away",
    competition: "明治安田J1リーグ",
    ourScore: 0,
    theirScore: 0,
    formation: "4-2-3-1",
    memo: [
      "町田GIONスタジアム。晴れ、16℃前後のアウェイで 0-0。公式の並びは 4-2-3-1 として見て、右に新井、左に中野、中はキムジュソンと荒木。ダブルピボットは川辺と中島。前は東、鈴木、浅野、鮎川。",
      "ボールは持てた。町田が最終ラインを深く置いて中央を埋めると、ペナルティエリアに入る前でパスの角度が消える。横に散らす時間のほうが長かった。東は左のハーフスペースに落ちて受け、浅野は右から中へ絞る。鮎川はポストに残るが、供給が横パスに寄った。",
      "プレスは、相手が最初の縦を入れたところへ川辺が踏み込む形。3バックの町田に前からはまり切らず、中盤で受け直されると東と新井のあいだが空く。前半の終わりにキムジュソンが下がる交代があり、左の幅の作り方が少し変わった。",
      "セットプレーでは荒木の競り合いが目立つ。枠内は少なく、守って終わった試合。これは公開の結果をもとにした自分用のメモで、細かい交代順はあとから直す。",
    ].join("\n\n"),
    pressingAim:
      "相手の最初の縦パスに川辺が踏み込み、前の4枚は近くの受け手を消す。町田の3バックには前から完全にははまらない。",
    buildupPattern:
      "中野と新井で幅を作り、東がハーフスペースに落ちて受ける。鈴木がトップ下で角度を変える。最終ラインはキムジュソンと荒木で安定させる。",
    keyMoments:
      "前半終了間際にキムジュソンが交代し、左の幅の作り方が変わる。決定機は少なく、セットプレーの競り合いが主な前進になった。",
    goodPoints:
      "ゼロを割らない守備。大迫のクロス処理と、荒木のセットプレーでの競り合い。ボールを手放さない時間は作れている。",
    issues:
      "エリア内に入る前でパスが横に流れる。プレスが前方ではまり切らず、中盤で受け直されるとサイドのあいだが空く。",
    motm: "大迫敬介",
    rating: 6,
    players: seedPlayers(),
    arrows: seedArrows,
    createdAt: "2026-11-08T15:40:00.000Z",
    updatedAt: "2026-11-08T15:40:00.000Z",
  }
}
