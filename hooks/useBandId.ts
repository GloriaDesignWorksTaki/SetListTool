import { useEffect, useState } from 'react'
import { useBand } from '@/contexts/BandContext'

interface UseBandIdOptions {
  /** バンドが存在しない場合に自動的に作成するかどうか */
  createIfNotExists?: boolean
  /** 作成時に使用するデフォルトのバンド名 */
  defaultBandName?: string
}

interface UseBandIdReturn {
  bandId: string | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

/**
 * BandContext 経由でバンドIDを取得する（重複 fetch なし）
 */
export const useBandId = (options: UseBandIdOptions = {}): UseBandIdReturn => {
  const { createIfNotExists = false, defaultBandName = 'My Band' } = options
  const { bandId, loading, error, refetch, ensureBand } = useBand()
  const [ensuring, setEnsuring] = useState(false)

  useEffect(() => {
    if (!createIfNotExists || bandId || loading || ensuring) {
      return
    }

    let cancelled = false
    setEnsuring(true)
    void ensureBand(defaultBandName).finally(() => {
      if (!cancelled) {
        setEnsuring(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [createIfNotExists, bandId, loading, ensuring, ensureBand, defaultBandName])

  return {
    bandId,
    loading: loading || ensuring,
    error,
    refetch,
  }
}
