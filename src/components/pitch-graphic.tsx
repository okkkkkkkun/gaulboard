import type { PointerEvent } from "react"
import { cn } from "cn"
import type { Arrow, Player } from "@/lib/types"

type Props = {
  players: Player[]
  arrows: Arrow[]
  uid: string
  selectedPlayerId?: string | null
  draftArrow?: Arrow | null
  showNames?: boolean
  interactive?: boolean
  className?: string
  onPointerDown?: (event: PointerEvent<SVGSVGElement>) => void
  onPointerMove?: (event: PointerEvent<SVGSVGElement>) => void
  onPointerUp?: (event: PointerEvent<SVGSVGElement>) => void
  onPlayerPointerDown?: (id: string, event: PointerEvent<SVGGElement>) => void
}

const view = { w: 68, h: 105 }

export function pctX(value: number) {
  return (value / 100) * view.w
}

export function pctY(value: number) {
  return (value / 100) * view.h
}

export function PitchGraphic({
  players,
  arrows,
  uid,
  selectedPlayerId,
  draftArrow,
  showNames = true,
  interactive = false,
  className = "",
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPlayerPointerDown,
}: Props) {
  const drawn = draftArrow ? [...arrows, draftArrow] : arrows
  return (
    <svg
      viewBox={`0 0 ${view.w} ${view.h}`}
      className={cn("block h-auto w-full touch-none select-none overflow-hidden", className)}
      role={interactive ? "application" : "img"}
      aria-label="ピッチ上の配置"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <PitchMarks uid={uid} />
      <text
        x={view.w / 2}
        y={3.15}
        textAnchor="middle"
        fill="rgba(246,241,232,0.72)"
        fontSize="1.55"
        fontFamily="Zen Kaku Gothic New, WenQuanYi Micro Hei, sans-serif"
      >
        相手ゴール
      </text>
      <text
        x={view.w / 2}
        y={103.55}
        textAnchor="middle"
        fill="rgba(246,241,232,0.72)"
        fontSize="1.55"
        fontFamily="Zen Kaku Gothic New, WenQuanYi Micro Hei, sans-serif"
      >
        広島ゴール
      </text>
      {drawn.map((arrow) => (
        <line
          key={arrow.id}
          x1={pctX(arrow.x1)}
          y1={pctY(arrow.y1)}
          x2={pctX(arrow.x2)}
          y2={pctY(arrow.y2)}
          stroke={arrow.kind === "press" ? "#E2B657" : "#F7F3EC"}
          strokeWidth={arrow.id === draftArrow?.id ? 0.72 : 0.48}
          strokeLinecap="round"
          markerEnd={`url(#${uid}-${arrow.kind})`}
        />
      ))}
      {players.map((player) => {
        const selected = player.id === selectedPlayerId
        const cx = pctX(player.x)
        const cy = pctY(player.y)
        return (
          <g
            key={player.id}
            onPointerDown={(event) => onPlayerPointerDown?.(player.id, event)}
            className={interactive ? "cursor-grab" : undefined}
          >
            {selected ? (
              <circle cx={cx} cy={cy} r={4.15} fill="none" stroke="#E2B657" strokeWidth={0.38} />
            ) : null}
            <circle cx={cx} cy={cy} r={3.15} fill="transparent" />
            <circle cx={cx} cy={cy} r={2.55} fill="#F6F1E8" stroke="#3A1458" strokeWidth={0.28} />
            <text
              x={cx}
              y={cy + 0.78}
              textAnchor="middle"
              fill="#3A1458"
              fontSize="2.05"
              fontWeight={700}
              fontFamily="Zen Kaku Gothic New, WenQuanYi Micro Hei, sans-serif"
            >
              {player.number || "·"}
            </text>
            {showNames ? (
              <text
                x={cx}
                y={cy + 4.55}
                textAnchor="middle"
                fill="#F7F3EC"
                stroke="#124A30"
                strokeWidth={0.38}
                paintOrder="stroke"
                fontSize={player.name.length > 6 ? 1.7 : 1.95}
                fontFamily="Zen Kaku Gothic New, WenQuanYi Micro Hei, sans-serif"
              >
                {player.name}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

function PitchMarks({ uid }: { uid: string }) {
  const x = 2.2
  const y = 4.2
  const w = 63.6
  const h = 96.6
  const cx = x + w / 2
  const cy = y + h / 2
  const penW = w * (40.32 / 68)
  const penH = h * (16.5 / 105)
  const sixW = w * (18.32 / 68)
  const sixH = h * (5.5 / 105)
  const penX = x + (w - penW) / 2
  const sixX = x + (w - sixW) / 2
  const spot = h * (11 / 105)
  const radius = w * (9.15 / 68)
  const line = "rgba(247,243,236,0.9)"

  return (
    <g>
      <defs>
        <pattern id={`${uid}-mow`} width={view.w} height={8.4} patternUnits="userSpaceOnUse">
          <rect width={view.w} height={8.4} fill="#166743" />
          <rect width={view.w} height={4.2} fill="#1C7A4E" />
        </pattern>
        <marker id={`${uid}-press`} markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto">
          <path d="M0 0.4 4.6 2.5 0 4.6Z" fill="#E2B657" />
        </marker>
        <marker id={`${uid}-move`} markerWidth="5" markerHeight="5" refX="4.2" refY="2.5" orient="auto">
          <path d="M0 0.4 4.6 2.5 0 4.6Z" fill="#F7F3EC" />
        </marker>
      </defs>
      <rect width={view.w} height={view.h} fill={`url(#${uid}-mow)`} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={line} strokeWidth={0.38} />
      <line x1={x} y1={cy} x2={x + w} y2={cy} stroke={line} strokeWidth={0.32} />
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke={line} strokeWidth={0.32} />
      <circle cx={cx} cy={cy} r={0.45} fill={line} />
      <rect x={penX} y={y} width={penW} height={penH} fill="none" stroke={line} strokeWidth={0.32} />
      <rect x={sixX} y={y} width={sixW} height={sixH} fill="none" stroke={line} strokeWidth={0.32} />
      <rect x={penX} y={y + h - penH} width={penW} height={penH} fill="none" stroke={line} strokeWidth={0.32} />
      <rect x={sixX} y={y + h - sixH} width={sixW} height={sixH} fill="none" stroke={line} strokeWidth={0.32} />
      <circle cx={cx} cy={y + spot} r={0.38} fill={line} />
      <circle cx={cx} cy={y + h - spot} r={0.38} fill={line} />
      <path
        d={`M ${cx - radius * 0.62} ${y + penH} A ${radius} ${radius} 0 0 0 ${cx + radius * 0.62} ${y + penH}`}
        fill="none"
        stroke={line}
        strokeWidth={0.32}
      />
      <path
        d={`M ${cx - radius * 0.62} ${y + h - penH} A ${radius} ${radius} 0 0 1 ${cx + radius * 0.62} ${y + h - penH}`}
        fill="none"
        stroke={line}
        strokeWidth={0.32}
      />
      <path d={`M ${x + 1.5} ${y} A 1.5 1.5 0 0 1 ${x} ${y + 1.5}`} fill="none" stroke={line} strokeWidth={0.28} />
      <path d={`M ${x + w - 1.5} ${y} A 1.5 1.5 0 0 0 ${x + w} ${y + 1.5}`} fill="none" stroke={line} strokeWidth={0.28} />
      <path d={`M ${x} ${y + h - 1.5} A 1.5 1.5 0 0 1 ${x + 1.5} ${y + h}`} fill="none" stroke={line} strokeWidth={0.28} />
      <path
        d={`M ${x + w} ${y + h - 1.5} A 1.5 1.5 0 0 0 ${x + w - 1.5} ${y + h}`}
        fill="none"
        stroke={line}
        strokeWidth={0.28}
      />
      <rect x={cx - 3.2} y={y - 1.35} width={6.4} height={1.35} fill="none" stroke={line} strokeWidth={0.28} />
      <rect x={cx - 3.2} y={y + h} width={6.4} height={1.35} fill="none" stroke={line} strokeWidth={0.28} />
    </g>
  )
}
