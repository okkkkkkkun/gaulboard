import { ArchiveScreen } from "@/components/archive-screen"
import { SiteHeader } from "@/components/site-header"

export const metadata = { title: "アーカイブ" }

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ArchiveScreen />
      </main>
    </>
  )
}
