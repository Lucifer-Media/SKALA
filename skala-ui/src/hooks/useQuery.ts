import { useEffect, useState, useCallback } from 'react'
import { message } from 'antd'
import type { AxiosPromise } from 'axios'

interface UseQueryResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useQuery<T>(
  fetcher: () => AxiosPromise<T>,
  deps: unknown[] = [],
  options?: { errorMessage?: string; autoRefresh?: number }
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetcher()
      setData(res.data)
      setError(null)
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        (e as Error)?.message ??
        (options?.errorMessage ?? 'Ошибка загрузки')
      setError(msg)
      if (!options?.errorMessage) message.error(msg)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetch()
    if (options?.autoRefresh) {
      const id = setInterval(fetch, options.autoRefresh)
      return () => clearInterval(id)
    }
  }, [fetch, options?.autoRefresh])

  return { data, loading, error, refetch: fetch }
}
