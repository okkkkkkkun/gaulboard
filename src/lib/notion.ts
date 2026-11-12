import { CLUB_SHORT, scoreboard, sheetCode, VENUE_LABEL } from "@/lib/card-logic"
import type { Card } from "@/lib/types"

export const NOTION_VERSION = "2022-06-28"

export const NOTION_PROPERTIES = [
  { name: "試合", type: "title", description: "日付と対戦相手。例: 2026-11-08 FC町田ゼルビア" },
  { name: "日付", type: "date", description: "試合日" },
  { name: "対戦相手", type: "rich_text", description: "相手クラブ名" },
  { name: "大会", type: "rich_text", description: "大会名。セレクトにしない" },
  { name: "会場", type: "rich_text", description: "ホーム または アウェイ" },
  { name: "スコア", type: "rich_text", description: "表示順のスコア。例: FC町田ゼルビア 0-0 広島" },
  { name: "フォーメーション", type: "rich_text", description: "カードに書いた並び" },
  { name: "プレッシング", type: "rich_text", description: "プレッシングの狙い" },
  { name: "ビルドアップ", type: "rich_text", description: "ビルドアップの形" },
  { name: "キーモーメント", type: "rich_text", description: "試合の要点" },
  { name: "良かった点", type: "rich_text", description: "保てたこと" },
  { name: "課題", type: "rich_text", description: "次に直すこと" },
  { name: "MOM", type: "rich_text", description: "マン・オブ・ザ・マッチ" },
  { name: "評価", type: "number", description: "0 から 10。未評価なら空" },
  { name: "メモ", type: "rich_text", description: "試合後メモの先頭" },
  { name: "配置", type: "rich_text", description: "選手と矢印のテキスト" },
] as const

export function notionConfig() {
  const token = process.env.NOTION_API_TOKEN?.trim()
  const databaseId = process.env.NOTION_DATABASE_ID?.trim()
  if (!token || !databaseId) return null
  return { token, databaseId }
}

export function notionProperties(card: Card) {
  const board = scoreboard(card)
  const score = `${board.leftName} ${board.leftScore}-${board.rightScore} ${board.rightName}`
  return {
    試合: titleProp(`${card.date} ${card.opponent}`),
    日付: { date: { start: card.date } },
    対戦相手: richText(card.opponent),
    大会: richText(card.competition),
    会場: richText(VENUE_LABEL[card.venue]),
    スコア: richText(score),
    フォーメーション: richText(card.formation),
    プレッシング: richText(card.pressingAim),
    ビルドアップ: richText(card.buildupPattern),
    キーモーメント: richText(card.keyMoments),
    良かった点: richText(card.goodPoints),
    課題: richText(card.issues),
    MOM: richText(card.motm),
    評価: { number: card.rating },
    メモ: richText(card.memo),
    配置: richText(placementText(card)),
  }
}

export function notionChildren(card: Card) {
  const blocks = [
    heading(`${sheetCode(card)}  ${CLUB_SHORT}`),
    paragraph(card.memo || "メモなし"),
    heading("プレッシング"),
    paragraph(card.pressingAim || "—"),
    heading("ビルドアップ"),
    paragraph(card.buildupPattern || "—"),
    heading("配置"),
    paragraph(placementText(card)),
  ]
  return blocks
}

export async function exportCardToNotion(card: Card, fetchImpl: typeof fetch = fetch) {
  const config = notionConfig()
  if (!config) {
    throw new Error("Notion のトークンかデータベース ID が未設定です。")
  }
  const response = await fetchImpl("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: config.databaseId },
      properties: notionProperties(card),
      children: notionChildren(card),
    }),
    signal: AbortSignal.timeout(30_000),
  })
  const payload = (await response.json().catch(() => null)) as { url?: string; message?: string } | null
  if (!response.ok) {
    const detail = payload?.message ? ` ${payload.message}` : ""
    throw new Error(`Notion が拒否しました。${detail}`.trim())
  }
  if (!payload?.url) throw new Error("Notion のページ URL を受け取れませんでした。")
  return { url: payload.url }
}

function titleProp(content: string) {
  return { title: [{ type: "text", text: { content: content.slice(0, 200) } }] }
}

function richText(content: string) {
  const text = content.trim().slice(0, 1900)
  if (!text) return { rich_text: [] }
  return { rich_text: [{ type: "text", text: { content: text } }] }
}

function heading(content: string) {
  return {
    object: "block",
    type: "heading_3",
    heading_3: { rich_text: [{ type: "text", text: { content: content.slice(0, 200) } }] },
  }
}

function paragraph(content: string) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: { rich_text: [{ type: "text", text: { content: content.slice(0, 1900) } }] },
  }
}

function placementText(card: Card) {
  const players = card.players
    .map((player) => `${player.number ? `${player.number} ` : ""}${player.name}`)
    .join(" / ")
  const arrows = card.arrows
    .map((arrow, index) => `${index + 1}.${arrow.kind === "press" ? "プレス" : "動き"}`)
    .join(" ")
  return [`フォーメーション ${card.formation}`, players, arrows && `矢印 ${arrows}`]
    .filter(Boolean)
    .join("\n")
}
