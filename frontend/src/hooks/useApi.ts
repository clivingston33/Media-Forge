import { useCallback, useState } from 'react'

export function useApi<TArgs extends unknown[], TResult>(
  request: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(
    async (...args: TArgs) => {
      setLoading(true)
      setError(null)

      try {
        return await request(...args)
      } catch (caughtError) {
        const message =
          caughtError instanceof Error ? caughtError.message : 'Something went wrong while talking to MediaForge.'
        setError(message)
        throw caughtError
      } finally {
        setLoading(false)
      }
    },
    [request],
  )

  return { execute, loading, error }
}
