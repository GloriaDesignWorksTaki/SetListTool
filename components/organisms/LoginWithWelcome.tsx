'use client'

import { useEffect, useState } from 'react'
import Auth from './Auth'
import type { MessageKey } from '@/i18n/messages'

type Notice = {
  type: 'success' | 'error'
  textKey: MessageKey
  allowResend?: boolean
}

export function LoginWithWelcome() {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    // 認証リンク経由の遷移を検知して、ログイン画面に結果を表示
    const handleAuthCallbackNotice = () => {
      if (typeof window === 'undefined') return

      const currentUrl = new URL(window.location.href)
      const queryType = currentUrl.searchParams.get('type')
      const queryAccessToken = currentUrl.searchParams.get('access_token')
      const queryCode = currentUrl.searchParams.get('code')
      const queryTokenHash = currentUrl.searchParams.get('token_hash')
      const queryError = currentUrl.searchParams.get('error')
      const queryErrorDescription = currentUrl.searchParams.get('error_description')

      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const hashAccessToken = hashParams.get('access_token')
      const hashType = hashParams.get('type')
      const hashCode = hashParams.get('code')
      const hashTokenHash = hashParams.get('token_hash')
      const hashError = hashParams.get('error')
      const hashErrorDescription = hashParams.get('error_description')

      const type = hashType || queryType
      const accessToken = hashAccessToken || queryAccessToken
      const error = hashError || queryError
      const errorDescription = hashErrorDescription || queryErrorDescription

      if (type === 'recovery') {
        const target = new URL('/reset-password', window.location.origin)
        if (window.location.hash) {
          target.hash = window.location.hash.replace(/^#/, '')
        }
        if (window.location.search) {
          const params = new URLSearchParams(window.location.search)
          params.forEach((value, key) => {
            target.searchParams.set(key, value)
          })
        }
        window.location.replace(target.toString())
        return
      }

      const isAuthCallback =
        type === 'email' ||
        type === 'signup' ||
        Boolean(accessToken) ||
        Boolean(queryCode || hashCode) ||
        Boolean(queryTokenHash || hashTokenHash) ||
        Boolean(error)

      if (!isAuthCallback) return

      if (error) {
        const normalized = `${error} ${errorDescription || ''}`.toLowerCase()
        const isExpired = normalized.includes('expired') || normalized.includes('otp_expired')
        setNotice({
          type: 'error',
          textKey: isExpired ? 'auth.verifyExpired' : 'auth.verifyFailed',
          allowResend: true,
        })
      } else {
        setNotice({
          type: 'success',
          textKey: 'auth.verifySuccess',
        })
      }

      window.history.replaceState(null, '', '/login')
    }

    handleAuthCallbackNotice()
  }, [])

  return <Auth notice={notice} />
}
