'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'
import { WelcomeModal } from '@/components/molecules/WelcomeModal'
import { bandService } from '@/services/bandService'
import Auth from './Auth'

export function LoginWithWelcome() {
  const router = useRouter()
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [isEmailConfirmationFlow, setIsEmailConfirmationFlow] = useState(false)

  useEffect(() => {
    // メール認証リンク経由のログインを検知してWelcomeを表示
    const handleEmailConfirmation = async () => {
      if (typeof window === 'undefined') return

      const currentUrl = new URL(window.location.href)
      const queryType = currentUrl.searchParams.get('type')
      const queryAccessToken = currentUrl.searchParams.get('access_token')
      const queryRefreshToken = currentUrl.searchParams.get('refresh_token')
      const queryCode = currentUrl.searchParams.get('code')
      const queryTokenHash = currentUrl.searchParams.get('token_hash')

      // ハッシュフラグメントからパラメータを取得
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const hashAccessToken = hashParams.get('access_token')
      const hashRefreshToken = hashParams.get('refresh_token')
      const hashType = hashParams.get('type')
      const hashCode = hashParams.get('code')
      const hashTokenHash = hashParams.get('token_hash')

      const type = hashType || queryType
      const accessToken = hashAccessToken || queryAccessToken
      const refreshToken = hashRefreshToken || queryRefreshToken

      // Supabaseの認証コールバックらしきURLかどうかを幅広く判定
      const isAuthCallback =
        type === 'email' ||
        type === 'signup' ||
        Boolean(accessToken) ||
        Boolean(queryCode || hashCode) ||
        Boolean(queryTokenHash || hashTokenHash)

      if (!isAuthCallback) return
      setIsEmailConfirmationFlow(true)

      // メール認証確認の場合
      if (accessToken) {
        try {
          // セッションを設定
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })

          if (sessionError) {
            console.error('セッション設定エラー:', sessionError)
            return
          }

          if (sessionData.user) {
            // バンド情報が存在しない場合、user_metadataから作成
            const bandId = await bandService.getBandId(sessionData.user.id)
            if (!bandId) {
              const bandName = sessionData.user.user_metadata?.band_name || 'My Band'
              const genre = sessionData.user.user_metadata?.genre || null
              try {
                await bandService.create(sessionData.user.id, bandName, undefined, genre)
              } catch (error) {
                console.error('バンド作成エラー:', error)
              }
            }

            // Welcomeポップアップを表示
            setShowWelcomeModal(true)
          }
        } catch (error) {
          console.error('メール認証処理エラー:', error)
        }
      } else {
        // PKCEやtoken_hash形式などではSDK側でセッションが復元済みの可能性がある
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const bandId = await bandService.getBandId(session.user.id)
          if (!bandId) {
            const bandName = session.user.user_metadata?.band_name || 'My Band'
            const genre = session.user.user_metadata?.genre || null
            try {
              await bandService.create(session.user.id, bandName, undefined, genre)
            } catch (error) {
              console.error('バンド作成エラー:', error)
            }
          }
          setShowWelcomeModal(true)
        }
      }

      // クエリとハッシュをクリア
      window.history.replaceState(null, '', '/login')
    }

    handleEmailConfirmation()
  }, [])

  return (
    <>
      <Auth disableAutoRedirect={isEmailConfirmationFlow || showWelcomeModal} />
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => {
          setShowWelcomeModal(false)
          setIsEmailConfirmationFlow(false)
          router.replace('/')
        }}
      />
    </>
  )
}