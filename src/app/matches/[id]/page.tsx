import { notFound } from "next/navigation"
import { CardScreen } from "@/components/card-screen"
import { SiteHeader } from "@/components/site-header"
import { getCard, getDb } from "@/lib/db"
import { integrationStatus } from "@/lib/integrations"
import { SEED_CARD_ID } from "@/lib/seed"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = getCard(getDb(), id)
  return { title: card ? card.opponent : "カード" }
}

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = getCard(getDb(), id)
  if (!card) notFound()
  const status = integrationStatus()
  return (
    <>
      <SiteHeader />
      <main>
        <CardScreen card={card} notionEnabled={status.notion} sample={card.id === SEED_CARD_ID} />
      </main>
    </>
  )
}
