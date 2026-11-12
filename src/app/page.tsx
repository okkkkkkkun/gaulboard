import { ArchiveScreen } from "@/components/archive-screen"
import { SiteHeader } from "@/components/site-header"
import { getDb, listCards } from "@/lib/db"

export const metadata = { title: "アーカイブ" }

export default function HomePage() {
  const cards = listCards(getDb())
  return (
    <>
      <SiteHeader />
      <main>
        <ArchiveScreen cards={cards} />
      </main>
    </>
  )
}
