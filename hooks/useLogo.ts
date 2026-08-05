import { useBand } from '@/contexts/BandContext'

interface UseLogoReturn {
  logoUrl: string
  loading: boolean
  refreshLogo: () => Promise<void>
}

/**
 * BandContext 経由でロゴURLを取得する（重複 fetch なし）
 * @param _bandId - 互換のため受け取るが未使用（Context の band を使う）
 */
export const useLogo = (_bandId?: string | null): UseLogoReturn => {
  const { logoUrl, loading, refetch } = useBand()

  return {
    logoUrl,
    loading,
    refreshLogo: refetch,
  }
}
