export function Mark({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const stroke = light ? "#F6F1E8" : "#5C2D86"
  return (
    <svg
      viewBox="0 0 36 24"
      aria-hidden="true"
      className={`h-6 w-9 ${className}`}
      fill="none"
    >
      <path d="M3 4.5 11 12 3 19.5" stroke={stroke} strokeWidth="1.7" />
      <path d="M14 4.5 22 12 14 19.5" stroke={stroke} strokeWidth="1.7" />
      <path d="M25 4.5 33 12 25 19.5" stroke={stroke} strokeWidth="1.7" />
    </svg>
  )
}
