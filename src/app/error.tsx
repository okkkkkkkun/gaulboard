"use client"

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-mincho text-3xl text-[#24142F]">シートを開けませんでした</h1>
      <p className="mt-3 text-sm text-[#6d6274]">もう一度開くか、アーカイブに戻ってください。</p>
      <button
        type="button"
        className="mt-6 rounded-lg bg-[#5C2D86] px-4 py-2 text-sm text-[#F7F3EC]"
        onClick={reset}
      >
        もう一度
      </button>
    </main>
  )
}
