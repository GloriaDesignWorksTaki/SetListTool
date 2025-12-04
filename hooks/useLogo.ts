import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/pages/api/supabaseClient'

interface UseLogoReturn {
  logoUrl: string
  loading: boolean
  refreshLogo: () => Promise<void>
}

/**
 * ロゴの読み込みを行うカスタムフック
 * @param bandId - バンドID
 * @returns ロゴURL、ローディング状態、再読み込み関数
 */
export const useLogo = (bandId: string | null): UseLogoReturn => {
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)

  // ロゴを取得
  const loadLogo = useCallback(async () => {
    try {
      setLoading(true)

      if (!bandId) {
        setLogoUrl('')
        setLoading(false)
        return
      }

      const { data: band, error } = await supabase
        .from('bands')
        .select('logo_url')
        .eq('id', bandId)
        .single()

      if (error) {
        // logo_urlカラムが存在しない場合は無視
        if (error.code === '42703') {
          console.log('logo_urlカラムが存在しません。データベースにカラムを追加してください。')
          setLogoUrl('')
          setLoading(false)
          return
        }
        console.error('ロゴ取得エラー:', error)
        setLogoUrl('')
        setLoading(false)
        return
      }

      if (band?.logo_url) {
        setLogoUrl(band.logo_url)
      } else {
        setLogoUrl('')
      }

      setLoading(false)
    } catch (error) {
      console.error('ロゴ取得エラー:', error)
      setLogoUrl('')
      setLoading(false)
    }
  }, [bandId])

  // バンドIDが変更されたときにロゴを再読み込み
  useEffect(() => {
    loadLogo()
  }, [loadLogo])

  return {
    logoUrl,
    loading,
    refreshLogo: loadLogo,
  }
}

