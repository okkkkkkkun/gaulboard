import { z } from "zod"
import { resolveTacticalModel } from "@/lib/ai/provider"
import { publicError } from "@/lib/public-error"

export const runtime = "nodejs"

const contextSchema = z.object({
  date: z.string(),
  opponent: z.string(),
  venue: z.enum(["home", "away"]),
  competition: z.string(),
  ourScore: z.number(),
  theirScore: z.number(),
  formation: z.string(),
  memo: z.string().max(8000),
})

export async function POST(request: Request) {
  const model = resolveTacticalModel()
  if (!model) {
    return Response.json(
      { ok: false, message: "AI下書きは未設定です。OPENAI_API_KEY がないので、欄は手で書いてください。" },
      { status: 503 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return Response.json({ ok: false, message: "メモを読み取れませんでした。" }, { status: 400 })
  }

  const parsed = contextSchema.safeParse(json)
  if (!parsed.success) {
    return Response.json({ ok: false, message: "メモの形が違います。" }, { status: 400 })
  }
  if (!parsed.data.memo.trim()) {
    return Response.json({ ok: false, message: "先に試合メモを書いてください。" }, { status: 400 })
  }

  try {
    const suggestion = await model.suggest(parsed.data)
    return Response.json({ ok: true, suggestion })
  } catch (error) {
    return Response.json(
      { ok: false, message: publicError(error, "下書きを受け取れませんでした。メモを短くして、もう一度試してください。") },
      { status: 502 },
    )
  }
}
