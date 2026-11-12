import { notFound } from "next/navigation"
import { MatchEditor } from "@/components/match-editor"
import { SiteHeader } from "@/components/site-header"
import { toDraft } from "@/lib/card-logic"
import { getCard, getDb } from "@/lib/db"
import { integrationStatus } from "@/lib/integrations"

export const metadata = { title: "編集" }

export default async function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = getCard(getDb(), id)
  if (!card) notFound()
  return (
    <>
      <SiteHeader />
      <main>
        <MatchEditor mode="edit" cardId={card.id} initial={toDraft(card)} aiEnabled={integrationStatus().ai} />
      </main>
    </>
  )
}
