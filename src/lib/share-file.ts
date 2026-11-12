export async function shareOrDownload(file: File) {
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "ガウルボード" })
      return "shared" as const
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled" as const
    }
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement("a")
  link.href = url
  link.download = file.name
  link.click()
  URL.revokeObjectURL(url)
  return "downloaded" as const
}
