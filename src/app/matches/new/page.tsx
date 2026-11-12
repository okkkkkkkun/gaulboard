import { MatchEditor } from "@/components/match-editor"
import { SiteHeader } from "@/components/site-header"
import { blankDraft } from "@/lib/draft"
import { integrationStatus } from "@/lib/integrations"

export const metadata = { title: "新しい試合" }

export default function NewMatchPage() {
  const status = integrationStatus()
  return (
    <>
      <SiteHeader />
      <main>
        <MatchEditor mode="create" cardId={null} initial={blankDraft()} aiEnabled={status.ai} />
      </main>
    </>
  )
}
