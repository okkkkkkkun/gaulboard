"use client"

import { useEffect, useState } from "react"

export function useIntegrations() {
  const [status, setStatus] = useState<{ ai: boolean; notion: boolean } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/integrations")
      .then((response) => response.json())
      .then((data: { ai?: boolean; notion?: boolean }) => {
        if (!cancelled) setStatus({ ai: Boolean(data.ai), notion: Boolean(data.notion) })
      })
      .catch(() => {
        if (!cancelled) setStatus({ ai: false, notion: false })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return status
}
