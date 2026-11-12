import { describe, expect, it } from "vitest"
import { extractJson, parseTacticalSuggestion } from "@/lib/ai/parse"
import { OpenAiCompatibleModel } from "@/lib/ai/provider"
import type { TacticalContext } from "@/lib/ai/provider"

const context: TacticalContext = {
  date: "2026-11-08",
  opponent: "FC町田ゼルビア",
  venue: "away",
  competition: "明治安田J1リーグ",
  ourScore: 0,
  theirScore: 0,
  formation: "4-2-3-1",
  memo: "ボールは持てたが、エリア内に入れなかった。",
}

describe("tactical suggestion parsing", () => {
  it("reads fenced json and snaps the rating onto the card scale", () => {
    const raw = extractJson('```json\n{"formation":"4-6-0","pressingAim":"前から","rating":6.24,"motm":" 大迫敬介 "}\n```')
    const suggestion = parseTacticalSuggestion(raw)
    expect(suggestion.formation).toBeNull()
    expect(suggestion.pressingAim).toBe("前から")
    expect(suggestion.rating).toBe(6)
    expect(suggestion.motm).toBe("大迫敬介")
  })

  it("asks the configured model without putting the key anywhere but the header", async () => {
    let authorization = ""
    const model = new OpenAiCompatibleModel({
      apiKey: "sk-test",
      baseUrl: "https://example.test/v1/",
      model: "sheet-model",
      fetchImpl: async (input, init) => {
        authorization = new Headers(init?.headers).get("Authorization") ?? ""
        const body = JSON.parse(String(init?.body)) as { model: string; messages: { content: string }[] }
        expect(String(input)).toBe("https://example.test/v1/chat/completions")
        expect(body.model).toBe("sheet-model")
        expect(body.messages[1]?.content).toContain("エリア内に入れなかった")
        expect(JSON.stringify(body)).not.toContain("sk-test")
        return Response.json({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  formation: "4-2-3-1",
                  pressingAim: "川辺が縦に踏み込む",
                  buildupPattern: "両サイドから",
                  keyMoments: "セットプレー",
                  goodPoints: "無失点",
                  issues: "決定機が少ない",
                  motm: "大迫敬介",
                  rating: 6,
                }),
              },
            },
          ],
        })
      },
    })

    const suggestion = await model.suggest(context)
    expect(authorization).toBe("Bearer sk-test")
    expect(suggestion.formation).toBe("4-2-3-1")
    expect(suggestion.pressingAim).toContain("川辺")
  })
})
