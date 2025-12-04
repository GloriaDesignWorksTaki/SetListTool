import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'

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
 * 現在のユーザーのバンドIDを取得するカスタムフック
 * @param options - フックのオプション
 * @returns バンドID、ローディング状態、エラー、再取得関数
 */
export const useBandId = (options: UseBandIdOptions = {}): UseBandIdReturn => {
  const { createIfNotExists = false, defaultBandName = 'My Band' } = options
  const { data: session } = useSession()
  const [bandId, setBandId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBandId = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!session?.user?.id) {
        setBandId(null)
        setLoading(false)
        return
      }

      // バンドIDを取得
      const existingBandId = await bandService.getBandId(session.user.id)

      // バンドが見つかった場合
      if (existingBandId) {
        setBandId(existingBandId)
        setLoading(false)
        return
      }

      // バンドが存在しない場合
      if (createIfNotExists) {
        // 自動的にバンドを作成
        try {
          const newBand = await bandService.create(session.user.id, defaultBandName)
          setBandId(newBand.id)
        } catch (err) {
          const error = err instanceof Error ? err : new Error('バンド作成エラー')
          logger.error('バンドID取得エラー:', error)
          setError(error)
          setBandId(null)
        }
      } else {
        // バンドが存在せず、作成もしない場合
        setBandId(null)
      }

      setLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('バンドID取得エラー')
      logger.error('バンドID取得エラー:', error)
      setError(error)
      setBandId(null)
      setLoading(false)
    }
  }, [session?.user?.id, createIfNotExists, defaultBandName])

  useEffect(() => {
    fetchBandId()
  }, [fetchBandId])

  return {
    bandId,
    loading,
    error,
    refetch: fetchBandId,
  }
}


