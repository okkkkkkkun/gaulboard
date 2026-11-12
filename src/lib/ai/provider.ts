import { extractJson, parseTacticalSuggestion, TACTICAL_SYSTEM_PROMPT, type TacticalSuggestion } from "@/lib/ai/parse"
import { CLUB, VENUE_LABEL } from "@/lib/card-logic"
import type { CardDraft } from "@/lib/types"

export type TacticalContext = Pick<
  CardDraft,
  "date" | "opponent" | "venue" | "competition" | "ourScore" | "theirScore" | "formation" | "memo"
>

export interface TacticalModel {
  readonly id: string
  suggest(context: TacticalContext): Promise<TacticalSuggestion>
}

type OpenAiOptions = {
  apiKey: string
  baseUrl: string
  model: string
  fetchImpl?: typeof fetch
}

export class OpenAiCompatibleModel implements TacticalModel {
  readonly id = "openai-compatible"

  constructor(private readonly options: OpenAiOptions) {}

  async suggest(context: TacticalContext) {
    const endpoint = `${this.options.baseUrl.replace(/\/$/, "")}/chat/completions`
    const response = await (this.options.fetchImpl ?? fetch)(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.options.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: TACTICAL_SYSTEM_PROMPT },
          { role: "user", content: userPrompt(context) },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    })

    if (!response.ok) {
      throw new Error(`モデルが ${response.status} を返しました。`)
    }

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = payload.choices?.[0]?.message?.content
    if (!content) throw new Error("モデルの応答が空でした。")
    return parseTacticalSuggestion(extractJson(content))
  }
}

export function resolveTacticalModel(): TacticalModel | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null
  return new OpenAiCompatibleModel({
    apiKey,
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
  })
}

function userPrompt(context: TacticalContext) {
  return [
    `クラブ: ${CLUB}`,
    `日付: ${context.date}`,
    `対戦相手: ${context.opponent || "未記入"}`,
    `会場: ${VENUE_LABEL[context.venue]}`,
    `大会: ${context.competition}`,
    `スコア: 広島 ${context.ourScore} - ${context.theirScore} ${context.opponent || "相手"}`,
    `いまのフォーメーション欄: ${context.formation}`,
    "",
    "試合後メモ:",
    context.memo.trim(),
  ].join("\n")
}
