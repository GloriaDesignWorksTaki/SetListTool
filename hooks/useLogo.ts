import { useState, useEffect, useCallback } from 'react'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'

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

      const logoUrlResult = await bandService.getLogoUrl(bandId)
      setLogoUrl(logoUrlResult || '')

      setLoading(false)
    } catch (error) {
      logger.error('ロゴ取得エラー:', error)
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

