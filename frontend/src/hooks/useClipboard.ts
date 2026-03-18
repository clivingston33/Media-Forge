import { useState } from 'react'

export function useClipboard() {
  const [clipboardError, setClipboardError] = useState<string | null>(null)

  async function readText() {
    try {
      const text = await navigator.clipboard.readText()
      setClipboardError(null)
      return text
    } catch (error) {
      setClipboardError(error instanceof Error ? error.message : 'Clipboard access is unavailable.')
      return ''
    }
  }

  return { readText, clipboardError }
}
