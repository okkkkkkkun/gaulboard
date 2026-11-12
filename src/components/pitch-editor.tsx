"use client"

import { useEffect, useRef, useState } from "react"
import type { PointerEvent } from "react"
import { PitchGraphic } from "@/components/pitch-graphic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { clamp } from "@/lib/card-logic"
import type { Arrow, ArrowKind, Player } from "@/lib/types"

type Mode = "place" | "arrow"

type Props = {
  players: Player[]
  arrows: Arrow[]
  onPlayersChange: (players: Player[]) => void
  onArrowsChange: (arrows: Arrow[]) => void
}

export function PitchEditor({ players, arrows, onPlayersChange, onArrowsChange }: Props) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [mode, setMode] = useState<Mode>("place")
  const [arrowKind, setArrowKind] = useState<ArrowKind>("press")
  const [selectedId, setSelectedId] = useState<string>(players[0]?.id ?? "")
  const [draftArrow, setDraftArrow] = useState<Arrow | null>(null)
  const draftRef = useRef<Arrow | null>(null)
  const drag = useRef<string | null>(null)

  const selected = players.find((player) => player.id === selectedId) ?? null

  function pointOf(event: PointerEvent) {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 3, 97),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 4, 96),
    }
  }

  function updatePlayer(id: string, patch: Partial<Player>) {
    onPlayersChange(players.map((player) => (player.id === id ? { ...player, ...patch } : player)))
  }

  function lockScroll() {
    document.body.style.overflow = "hidden"
  }

  function unlockScroll() {
    document.body.style.overflow = ""
  }

  function onPlayerPointerDown(id: string, event: PointerEvent<SVGGElement>) {
    if (mode === "arrow") return
    event.stopPropagation()
    event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId)
    lockScroll()
    drag.current = id
    setSelectedId(id)
  }

  function onPointerDown(event: PointerEvent<SVGSVGElement>) {
    const point = pointOf(event)
    if (!point) return
    if (mode === "place") return
    lockScroll()
    event.currentTarget.setPointerCapture(event.pointerId)
    const next = {
      id: "draft",
      x1: point.x,
      y1: point.y,
      x2: point.x,
      y2: point.y,
      kind: arrowKind,
    }
    draftRef.current = next
    setDraftArrow(next)
  }

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const point = pointOf(event)
    if (!point) return
    if (mode === "place" && drag.current) {
      updatePlayer(drag.current, point)
      return
    }
    if (draftRef.current) {
      const next = { ...draftRef.current, x2: point.x, y2: point.y }
      draftRef.current = next
      setDraftArrow(next)
    }
  }

  function onPointerUp() {
    const arrow = draftRef.current
    if (arrow) {
      const length = Math.hypot(arrow.x2 - arrow.x1, arrow.y2 - arrow.y1)
      if (length >= 4 && arrows.length < 16) {
        onArrowsChange([...arrows, { ...arrow, id: `arrow-${crypto.randomUUID()}` }])
      }
      draftRef.current = null
      setDraftArrow(null)
    }
    drag.current = null
    unlockScroll()
  }

  function nudge(dx: number, dy: number) {
    if (!selected) return
    updatePlayer(selected.id, {
      x: clamp(selected.x + dx, 3, 97),
      y: clamp(selected.y + dy, 4, 96),
    })
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (mode !== "place" || !selected) return
      const target = event.target
      if (target instanceof HTMLElement && target.closest("input, textarea, select, button")) return
      const step = event.shiftKey ? 4 : 1.5
      const delta =
        event.key === "ArrowUp" ? [0, -step] :
        event.key === "ArrowDown" ? [0, step] :
        event.key === "ArrowLeft" ? [-step, 0] :
        event.key === "ArrowRight" ? [step, 0] :
        null
      if (!delta) return
      event.preventDefault()
      onPlayersChange(
        players.map((player) =>
          player.id === selected.id
            ? { ...player, x: clamp(player.x + delta[0], 3, 97), y: clamp(player.y + delta[1], 4, 96) }
            : player,
        ),
      )
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [mode, onPlayersChange, players, selected])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,440px)_minmax(220px,1fr)]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Button
            type="button"
            size="lg"
            className="min-h-11 px-3"
            variant={mode === "place" ? "default" : "outline"}
            aria-pressed={mode === "place"}
            onClick={() => setMode("place")}
          >
            配置
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-11 px-3"
            variant={mode === "arrow" ? "default" : "outline"}
            aria-pressed={mode === "arrow"}
            onClick={() => setMode("arrow")}
          >
            矢印
          </Button>
          {mode === "arrow" ? (
            <>
              <Button
                type="button"
                size="lg"
            className="min-h-11 px-3"
                variant={arrowKind === "press" ? "default" : "outline"}
                onClick={() => setArrowKind("press")}
              >
                プレス
              </Button>
              <Button
                type="button"
                size="lg"
            className="min-h-11 px-3"
                variant={arrowKind === "move" ? "default" : "outline"}
                onClick={() => setArrowKind("move")}
              >
                動き
              </Button>
            </>
          ) : null}
        </div>
        <div className="overflow-hidden rounded-xl shadow-[0_18px_40px_-28px_rgba(36,20,47,0.7)] ring-1 ring-[#3A1458]/15">
          <div
            ref={(node) => {
              svgRef.current = node?.querySelector("svg") ?? null
            }}
            className="relative aspect-[68/105] touch-none bg-[#145C3C] overscroll-none"
          >
            <PitchGraphic
              uid="editor"
              players={players}
              arrows={arrows}
              draftArrow={draftArrow}
              selectedPlayerId={selectedId}
              interactive
              className="absolute inset-0 h-full w-full"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPlayerPointerDown={onPlayerPointerDown}
            />
          </div>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#6d6274]">
          {mode === "place"
            ? "選手をドラッグして置く。キーボードの矢印でも動かせます。"
            : "ピッチをドラッグして矢印を引く。金色がプレス、白が動きです。"}
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10">
          <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">選んでいる選手</p>
          {selected ? (
            <div className="mt-3 grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="player-name">名前</Label>
                <Input
                  id="player-name"
                  value={selected.name}
                  maxLength={40}
                  onChange={(event) => updatePlayer(selected.id, { name: event.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="player-number">背番号</Label>
                <Input
                  id="player-number"
                  value={selected.number}
                  inputMode="numeric"
                  maxLength={3}
                  className="max-w-28"
                  onChange={(event) => updatePlayer(selected.id, { number: event.target.value.replace(/\D/g, "") })}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span />
                <Button type="button" variant="outline" className="min-h-11" onClick={() => nudge(0, -1.5)} aria-label="上へ">
                  上
                </Button>
                <span />
                <Button type="button" variant="outline" className="min-h-11" onClick={() => nudge(-1.5, 0)} aria-label="左へ">
                  左
                </Button>
                <Button type="button" variant="outline" className="min-h-11" onClick={() => nudge(0, 1.5)} aria-label="下へ">
                  下
                </Button>
                <Button type="button" variant="outline" className="min-h-11" onClick={() => nudge(1.5, 0)} aria-label="右へ">
                  右
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-[#6d6274]">選手をタップしてください。</p>
          )}
        </div>
        <div className="rounded-xl bg-[#FBF8F3] p-4 ring-1 ring-[#3A1458]/10">
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-[0.16em] text-[#5C2D86]">矢印 {arrows.length}/16</p>
            {arrows.length > 0 ? (
              <button
                type="button"
                className="text-xs text-[#6d6274] underline-offset-2 hover:underline"
                onClick={() => onArrowsChange([])}
              >
                すべて消す
              </button>
            ) : null}
          </div>
          {arrows.length === 0 ? (
            <p className="mt-2 text-sm text-[#6d6274]">まだありません。矢印モードでピッチをドラッグします。</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {arrows.map((arrow, index) => (
                <li key={arrow.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>
                    {index + 1}. {arrow.kind === "press" ? "プレス" : "動き"}
                  </span>
                  <button
                    type="button"
                    className="text-xs text-[#8A3A3A] underline-offset-2 hover:underline"
                    onClick={() => onArrowsChange(arrows.filter((item) => item.id !== arrow.id))}
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
