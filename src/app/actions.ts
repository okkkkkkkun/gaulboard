"use server"

import { revalidatePath } from "next/cache"
import { resolveTacticalModel, type TacticalContext } from "@/lib/ai/provider"
import { validateCardInput } from "@/lib/card-logic"
import { deleteCard, getCard, getDb, insertCard, updateCard } from "@/lib/db"
import { exportCardToNotion } from "@/lib/notion"
import type { CardInput } from "@/lib/types"

export async function saveCard(id: string | null, input: CardInput) {
  const parsed = validateCardInput(input)
  if (!parsed.ok) return { ok: false as const, message: parsed.message }

  try {
    const db = getDb()
    const card = id ? updateCard(db, id, parsed.data) : insertCard(db, parsed.data)
    if (!card) return { ok: false as const, message: "カードが見つかりませんでした。" }
    revalidatePath("/")
    revalidatePath(`/matches/${card.id}`)
    revalidatePath(`/matches/${card.id}/edit`)
    return { ok: true as const, id: card.id }
  } catch {
    return { ok: false as const, message: "保存できませんでした。ディスクの空きを確認してください。" }
  }
}

export async function removeCard(id: string) {
  try {
    const removed = deleteCard(getDb(), id)
    if (!removed) return { ok: false as const, message: "カードが見つかりませんでした。" }
    revalidatePath("/")
    return { ok: true as const }
  } catch {
    return { ok: false as const, message: "削除できませんでした。" }
  }
}

export async function draftFromMemo(context: TacticalContext) {
  if (!context.memo.trim()) {
    return { ok: false as const, message: "先に試合メモを書いてください。" }
  }
  const model = resolveTacticalModel()
  if (!model) {
    return {
      ok: false as const,
      message: "AI下書きは未設定です。OPENAI_API_KEY がないので、欄は手で書いてください。",
    }
  }
  try {
    const suggestion = await model.suggest(context)
    return { ok: true as const, suggestion }
  } catch (error) {
    return { ok: false as const, message: safeMessage(error, "下書きを受け取れませんでした。メモを短くして、もう一度試してください。") }
  }
}

export async function exportNotion(id: string) {
  const card = getCard(getDb(), id)
  if (!card) return { ok: false as const, message: "カードが見つかりませんでした。" }
  try {
    const result = await exportCardToNotion(card)
    return { ok: true as const, url: result.url }
  } catch (error) {
    return { ok: false as const, message: safeMessage(error, "Notion への書き出しに失敗しました。") }
  }
}

function safeMessage(error: unknown, fallback: string) {
  const message = error instanceof Error && error.message ? error.message : fallback
  return message.replace(/Bearer\s+\S+/gi, "Bearer …").replace(/secret_\S+/gi, "secret_…").slice(0, 280)
}
