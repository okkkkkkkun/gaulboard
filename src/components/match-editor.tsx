"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { PitchEditor } from "@/components/pitch-editor"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { draftFromMemo, removeCard, saveCard } from "@/app/actions"
import { COMPETITIONS, CLUB_SHORT, hasTacticalText, VENUE_LABEL } from "@/lib/card-logic"
import { FORMATION_IDS, reseatPlayers } from "@/lib/formations"
import type { TacticalSuggestion } from "@/lib/ai/parse"
import type { CardDraft, Venue } from "@/lib/types"

type Props = {
  mode: "create" | "edit"
  cardId: string | null
  initial: CardDraft
  aiEnabled: boolean
}

export function MatchEditor({ mode, cardId, initial, aiEnabled }: Props) {
  const router = useRouter()
  const [draft, setDraft] = useState<CardDraft>(initial)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [drafting, setDrafting] = useState(false)
  const [confirmAi, setConfirmAi] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function patch(partial: Partial<CardDraft>) {
    setDraft((current) => ({ ...current, ...partial }))
  }

  function applyFormation(formation: string) {
    setDraft((current) => ({
      ...current,
      formation,
      players: reseatPlayers(current.players, formation),
    }))
  }

  function applySuggestion(suggestion: TacticalSuggestion) {
    setDraft((current) => {
      const formation = suggestion.formation ?? current.formation
      return {
        ...current,
        formation,
        players:
          suggestion.formation && suggestion.formation !== current.formation
            ? reseatPlayers(current.players, suggestion.formation)
            : current.players,
        pressingAim: suggestion.pressingAim,
        buildupPattern: suggestion.buildupPattern,
        keyMoments: suggestion.keyMoments,
        goodPoints: suggestion.goodPoints,
        issues: suggestion.issues,
        motm: suggestion.motm,
        rating: suggestion.rating,
      }
    })
    setNotice("下書きを入れました。違和感があれば、その場で直してください。")
  }

  async function runAi() {
    setConfirmAi(false)
    setDrafting(true)
    setError(null)
    const result = await draftFromMemo({
      date: draft.date,
      opponent: draft.opponent,
      venue: draft.venue,
      competition: draft.competition,
      ourScore: draft.ourScore,
      theirScore: draft.theirScore,
      formation: draft.formation,
      memo: draft.memo,
    })
    setDrafting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    applySuggestion(result.suggestion)
  }

  async function onSave() {
    setSaving(true)
    setError(null)
    const result = await saveCard(cardId, {
      ...draft,
      ourScore: Number(draft.ourScore),
      theirScore: Number(draft.theirScore),
    })
    if (!result.ok) {
      setSaving(false)
      setError(result.message)
      return
    }
    router.push(`/matches/${result.id}`)
  }

  async function onDelete() {
    if (!cardId) return
    const result = await removeCard(cardId)
    if (!result.ok) {
      setError(result.message)
      setConfirmDelete(false)
      return
    }
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[#5C2D86]">MATCH SHEET</p>
          <h1 className="font-mincho text-3xl text-[#24142F] sm:text-4xl">
            {mode === "create" ? "新しい試合" : "シートを直す"}
          </h1>
        </div>
        {mode === "edit" ? (
          <Button type="button" variant="outline" onClick={() => setConfirmDelete(true)}>
            このカードを削除
          </Button>
        ) : null}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="space-y-4">
          <section className="rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="日付" htmlFor="date">
                <Input
                  id="date"
                  type="date"
                  value={draft.date}
                  onChange={(event) => patch({ date: event.target.value })}
                />
              </Field>
              <Field label="対戦相手" htmlFor="opponent">
                <Input
                  id="opponent"
                  value={draft.opponent}
                  placeholder="浦和レッズ"
                  maxLength={60}
                  onChange={(event) => patch({ opponent: event.target.value })}
                />
              </Field>
              <Field label="大会" htmlFor="competition">
                <Input
                  id="competition"
                  list="competitions"
                  value={draft.competition}
                  maxLength={60}
                  onChange={(event) => patch({ competition: event.target.value })}
                />
                <datalist id="competitions">
                  {COMPETITIONS.map((competition) => (
                    <option key={competition} value={competition} />
                  ))}
                </datalist>
              </Field>
              <div className="grid gap-1.5">
                <span className="text-sm font-medium">会場</span>
                <div className="grid grid-cols-2 gap-2">
                  {(["home", "away"] as Venue[]).map((venue) => (
                    <Button
                      key={venue}
                      type="button"
                      variant={draft.venue === venue ? "default" : "outline"}
                      aria-pressed={draft.venue === venue}
                      onClick={() => patch({ venue })}
                    >
                      {VENUE_LABEL[venue]}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium">スコア</span>
              <p className="mt-1 text-xs text-[#6d6274]">広島の得点と、相手の得点です。並び順は会場に合わせてカード側で入れ替わります。</p>
              <div className="mt-2 flex items-center gap-3">
                <ScoreInput
                  label={CLUB_SHORT}
                  value={draft.ourScore}
                  onChange={(ourScore) => patch({ ourScore })}
                />
                <span className="font-mincho text-2xl text-[#5C2D86]">–</span>
                <ScoreInput
                  label="相手"
                  value={draft.theirScore}
                  onChange={(theirScore) => patch({ theirScore })}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10 sm:p-5">
            <div className="mb-4">
              <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">フォーメーション</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FORMATION_IDS.map((id) => (
                  <Button
                    key={id}
                    type="button"
                    size="sm"
                    variant={draft.formation === id ? "default" : "outline"}
                    onClick={() => applyFormation(id)}
                  >
                    {id}
                  </Button>
                ))}
              </div>
              <div className="mt-3 grid gap-1.5">
                <Label htmlFor="formation-name">カードに書く名前</Label>
                <Input
                  id="formation-name"
                  value={draft.formation}
                  maxLength={20}
                  onChange={(event) => patch({ formation: event.target.value })}
                />
                <p className="text-xs text-[#6d6274]">ボタンは配置を入れ替えます。名前だけの修正は、選手の位置を動かしません。</p>
              </div>
            </div>
            <PitchEditor
              players={draft.players}
              arrows={draft.arrows}
              onPlayersChange={(players) => patch({ players })}
              onArrowsChange={(arrows) => patch({ arrows })}
            />
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100dvh-5.5rem)] lg:overflow-y-auto lg:pr-1">
          <section className="rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10 sm:p-5">
            <Label htmlFor="memo">試合後メモ</Label>
            <Textarea
              id="memo"
              value={draft.memo}
              maxLength={8000}
              placeholder="終わったあとに残しておきたいこと。配置の意図、嫌だったシーン、次に見たい動き。"
              className="mt-2 min-h-40"
              onChange={(event) => patch({ memo: event.target.value })}
            />
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                disabled={!aiEnabled || drafting || !draft.memo.trim()}
                onClick={() => {
                  if (hasTacticalText(draft)) setConfirmAi(true)
                  else void runAi()
                }}
              >
                {drafting ? "下書き中…" : "メモから下書き"}
              </Button>
              <p className="mt-2 text-xs leading-relaxed text-[#6d6274]">
                {aiEnabled
                  ? "メモをサーバー側のモデルに送り、下の欄を下書きします。キーはブラウザに出ません。"
                  : "AI下書きはオフです。サーバーに OPENAI_API_KEY を入れると使えます。キーがなくても、下の欄はすべて手で書けます。"}
              </p>
            </div>
          </section>

          <section className="space-y-3 rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10 sm:p-5">
            <TacticalField label="プレッシングの狙い" value={draft.pressingAim} onChange={(pressingAim) => patch({ pressingAim })} />
            <TacticalField label="ビルドアップ" value={draft.buildupPattern} onChange={(buildupPattern) => patch({ buildupPattern })} />
            <TacticalField label="キーモーメント" value={draft.keyMoments} onChange={(keyMoments) => patch({ keyMoments })} rows={4} />
            <TacticalField label="良かった点" value={draft.goodPoints} onChange={(goodPoints) => patch({ goodPoints })} />
            <TacticalField label="課題" value={draft.issues} onChange={(issues) => patch({ issues })} />
            <Field label="マン・オブ・ザ・マッチ" htmlFor="motm">
              <Input id="motm" value={draft.motm} maxLength={40} onChange={(event) => patch({ motm: event.target.value })} />
            </Field>
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="rating">評価</Label>
                <span className="font-mincho text-2xl text-[#3A1458]">
                  {draft.rating === null ? "未評価" : draft.rating.toFixed(1)}
                </span>
              </div>
              <input
                id="rating"
                type="range"
                min={0}
                max={10}
                step={0.5}
                disabled={draft.rating === null}
                value={draft.rating ?? 6}
                className="mt-2 w-full accent-[#5C2D86] disabled:opacity-40"
                onChange={(event) => patch({ rating: Number(event.target.value) })}
              />
              <button
                type="button"
                className="mt-1 text-xs text-[#5C2D86] underline-offset-2 hover:underline"
                onClick={() => patch({ rating: draft.rating === null ? 6 : null })}
              >
                {draft.rating === null ? "評価を付ける" : "未評価に戻す"}
              </button>
            </div>
          </section>

          {error ? <p className="rounded-lg bg-[#F8E8E4] px-3 py-2 text-sm text-[#7A2E2E]">{error}</p> : null}
          {notice ? <p className="rounded-lg bg-[#EFE6F6] px-3 py-2 text-sm text-[#3A1458]">{notice}</p> : null}

          <Button type="button" size="lg" className="hidden h-11 w-full lg:inline-flex" disabled={saving} onClick={() => void onSave()}>
            {saving ? "保存しています…" : "保存してカードを見る"}
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E0D5C8] bg-[#FBF8F3]/95 p-3 backdrop-blur lg:hidden">
        <Button type="button" size="lg" className="h-11 w-full" disabled={saving} onClick={() => void onSave()}>
          {saving ? "保存しています…" : "保存してカードを見る"}
        </Button>
      </div>

      <Dialog open={confirmAi} onOpenChange={setConfirmAi}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>下書きで置き換えます</DialogTitle>
            <DialogDescription>
              プレッシング、ビルドアップ、キーモーメント、良かった点、課題、MOM、評価を、メモからの下書きで上書きします。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmAi(false)}>
              戻る
            </Button>
            <Button type="button" onClick={() => void runAi()}>
              置き換える
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>このカードを削除します</DialogTitle>
            <DialogDescription>アーカイブからも消えます。戻す操作はありません。</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDelete(false)}>
              戻る
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onDelete()}>
              削除する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="grid gap-1">
      <span className="text-xs text-[#6d6274]">{label}</span>
      <Input
        type="number"
        min={0}
        max={30}
        inputMode="numeric"
        value={value}
        className="w-20 font-mincho text-lg"
        onChange={(event) => onChange(clampScore(event.target.value))}
      />
    </label>
  )
}

function clampScore(value: string) {
  if (value.trim() === "") return 0
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 0
  return Math.max(0, Math.min(30, Math.trunc(parsed)))
}

function TacticalField({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
}) {
  const id = `field-${label}`
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} rows={rows} onChange={(event) => onChange(event.target.value)} />
    </div>
  )
}
