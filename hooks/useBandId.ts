import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/pages/api/supabaseClient'

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

      // バンドを検索
      const { data: band, error: fetchError } = await supabase
        .from('bands')
        .select('id, name')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (fetchError) {
        console.error('バンドID取得エラー:', fetchError)
        setError(new Error(`バンドID取得エラー: ${fetchError.message}`))
        setBandId(null)
        setLoading(false)
        return
      }

      // バンドが見つかった場合
      if (band) {
        setBandId(band.id)
        setLoading(false)
        return
      }

      // バンドが存在しない場合
      if (createIfNotExists) {
        // 自動的にバンドを作成
        const { data: newBand, error: createError } = await supabase
          .from('bands')
          .insert([
            {
              user_id: session.user.id,
              name: defaultBandName,
            },
          ])
          .select('id, name')
          .single()

        if (createError) {
          console.error('バンド作成エラー:', createError)
          setError(new Error(`バンド作成エラー: ${createError.message}`))
          setBandId(null)
        } else {
          setBandId(newBand?.id || null)
        }
      } else {
        // バンドが存在せず、作成もしない場合
        setBandId(null)
      }

      setLoading(false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('バンドID取得エラー')
      console.error('バンドID取得エラー:', error)
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


