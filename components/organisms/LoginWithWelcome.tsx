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

  useEffect(() => {
    // ハッシュフラグメントからメール認証確認を処理
    const handleEmailConfirmation = async () => {
      if (typeof window === 'undefined') return

      // ハッシュフラグメントをチェック
      const hash = window.location.hash
      if (!hash || hash.length === 0) return

      // ハッシュフラグメントからパラメータを取得
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      // メール認証確認の場合
      if (type === 'email' && accessToken) {
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
            
            // ハッシュをクリア
            window.history.replaceState(null, '', '/login')
          }
        } catch (error) {
          console.error('メール認証処理エラー:', error)
        }
      }
    }

    handleEmailConfirmation()
  }, [])

  return (
    <>
      <Auth />
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
      />
    </>
  )
}
