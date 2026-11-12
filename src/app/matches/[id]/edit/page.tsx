import { EditRoute } from "@/components/match-editor"
import { SiteHeader } from "@/components/site-header"

export const metadata = { title: "編集" }

export default function EditMatchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <EditRoute />
      </main>
    </>
  )
}
