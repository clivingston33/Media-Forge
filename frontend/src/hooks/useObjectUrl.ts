import { useEffect, useMemo } from 'react'

export function useObjectUrl(file: File | null | undefined) {
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file])

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  return objectUrl
}
