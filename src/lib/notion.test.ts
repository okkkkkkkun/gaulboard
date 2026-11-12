import { describe, expect, it } from "vitest"
import { NOTION_PROPERTIES, notionChildren, notionProperties } from "@/lib/notion"
import { seedCard } from "@/lib/seed"

describe("notion export payload", () => {
  it("uses the database properties documented for the card", () => {
    const properties = notionProperties(seedCard())
    expect(Object.keys(properties)).toEqual(NOTION_PROPERTIES.map((property) => property.name))
    expect(properties["試合"]).toMatchObject({
      title: [{ text: { content: "2026-11-08 FC町田ゼルビア" } }],
    })
    expect(properties["日付"]).toEqual({ date: { start: "2026-11-08" } })
    expect(properties["会場"]).toMatchObject({
      rich_text: [{ text: { content: "アウェイ" } }],
    })
    expect(properties["スコア"]).toMatchObject({
      rich_text: [{ text: { content: "FC町田ゼルビア 0-0 広島" } }],
    })
    expect(properties["評価"]).toEqual({ number: 6 })
    expect(notionChildren(seedCard()).length).toBeGreaterThan(4)
  })
})
