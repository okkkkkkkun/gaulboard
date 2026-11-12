import { CardRoute } from "@/components/card-screen"
import { SiteHeader } from "@/components/site-header"

export const metadata = { title: "カード" }

export default function CardPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <CardRoute />
      </main>
    </>
  )
}
