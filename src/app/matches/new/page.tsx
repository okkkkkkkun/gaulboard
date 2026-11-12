import { MatchEditor } from "@/components/match-editor"
import { SiteHeader } from "@/components/site-header"
import { blankDraft } from "@/lib/draft"

export const metadata = { title: "新しい試合" }

export default function NewMatchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <MatchEditor mode="create" cardId={null} initial={blankDraft()} />
      </main>
    </>
  )
}
