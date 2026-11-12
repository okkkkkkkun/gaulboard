import { parseStoredCard } from "@/lib/backup"
import { notionConfig, exportCardToNotion } from "@/lib/notion"
import { publicError } from "@/lib/public-error"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!notionConfig()) {
    return Response.json(
      {
        ok: false,
        message: "Notionへの書き出しはオフです。NOTION_API_TOKEN と NOTION_DATABASE_ID をサーバーに入れると送れます。",
      },
      { status: 503 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ ok: false, message: "カードを読み取れませんでした。" }, { status: 400 })
  }

  const card = parseStoredCard(json)
  if (!card) {
    return Response.json({ ok: false, message: "カードの形が違います。" }, { status: 400 })
  }

  try {
    const result = await exportCardToNotion(card)
    return Response.json({ ok: true, url: result.url })
  } catch (error) {
    return Response.json(
      { ok: false, message: publicError(error, "Notion への書き出しに失敗しました。") },
      { status: 502 },
    )
  }
}
