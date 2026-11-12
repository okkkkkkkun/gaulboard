export function publicError(error: unknown, fallback: string) {
  const message = error instanceof Error && error.message ? error.message : fallback
  return message.replace(/Bearer\s+\S+/gi, "Bearer …").replace(/secret_\S+/gi, "secret_…").slice(0, 280)
}
