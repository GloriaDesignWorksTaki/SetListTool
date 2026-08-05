'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'
import { validatePassword, validatePasswordConfirmation } from '@/utils/validation'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [preparing, setPreparing] = useState(true)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const prepareSession = async () => {
      if (typeof window === 'undefined') return

      try {
        const url = new URL(window.location.href)
        const queryCode = url.searchParams.get('code')
        const queryAccessToken = url.searchParams.get('access_token')
        const queryRefreshToken = url.searchParams.get('refresh_token')
        const queryType = url.searchParams.get('type')
        const queryError = url.searchParams.get('error')
        const queryErrorDescription = url.searchParams.get('error_description')

        const hash = window.location.hash
        const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        const hashAccessToken = hashParams.get('access_token')
        const hashRefreshToken = hashParams.get('refresh_token')
        const hashType = hashParams.get('type')
        const hashError = hashParams.get('error')
        const hashErrorDescription = hashParams.get('error_description')

        const error = hashError || queryError
        const errorDescription = hashErrorDescription || queryErrorDescription
        if (error) {
          const normalized = `${error} ${errorDescription || ''}`.toLowerCase()
          const isExpired = normalized.includes('expired') || normalized.includes('otp_expired')
          setError(
            isExpired
              ? '再設定リンクの有効期限が切れています。もう一度メールを送信してください。'
              : '再設定リンクが無効です。もう一度メールを送信してください。'
          )
          setPreparing(false)
          return
        }

        const type = hashType || queryType
        const accessToken = hashAccessToken || queryAccessToken
        const refreshToken = hashRefreshToken || queryRefreshToken

        if (queryCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryCode)
          if (exchangeError) {
            setError('再設定セッションの確立に失敗しました。リンクを再送してください。')
            setPreparing(false)
            return
          }
          setReady(true)
        } else if (accessToken && (type === 'recovery' || !type)) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          })
          if (sessionError) {
            setError('再設定セッションの確立に失敗しました。リンクを再送してください。')
            setPreparing(false)
            return
          }
          setReady(true)
        } else {
          // すでにセッションがあれば可
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session) {
            setReady(true)
          } else {
            setError('再設定リンクが無効、または期限切れです。もう一度メールを送信してください。')
          }
        }

        // URL をクリーンにする
        window.history.replaceState(null, '', '/reset-password')
      } catch {
        setError('再設定の準備中にエラーが発生しました。')
      } finally {
        setPreparing(false)
      }
    }

    void prepareSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'パスワードを確認してください')
      return
    }

    const confirmValidation = validatePasswordConfirmation(password, confirmPassword)
    if (!confirmValidation.isValid) {
      setError(confirmValidation.error || 'パスワード再入力を確認してください')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(`パスワードの更新に失敗しました: ${updateError.message}`)
        return
      }

      // 再設定用セッションはログアウトしてログインへ
      await supabase.auth.signOut({ scope: 'local' })
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー'
      setError(`パスワードの更新に失敗しました: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
        <h2>新しいパスワード</h2>

        {preparing && <p className="desc">準備中...</p>}

        {error && <div className="errorMessage">{error}</div>}

        {success ? (
          <>
            <div className="authNotice authNoticeSuccess">
              パスワードを更新しました。新しいパスワードでログインしてください。
            </div>
            <button
              type="button"
              className="submitButton"
              onClick={() => router.push('/login')}
            >
              <span>ログインへ</span>
            </button>
          </>
        ) : (
          ready &&
          !preparing && (
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                className="input"
                placeholder="新しいパスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <input
                type="password"
                className="input"
                placeholder="新しいパスワード（確認）"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="submit"
                className={`submitButton ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                <span>{loading ? '更新中...' : 'パスワードを更新'}</span>
              </button>
            </form>
          )
        )}

        {!success && (
          <p className="signUpButton" onClick={() => router.push('/forgot-password')}>
            再設定メールを送り直す
          </p>
        )}
        <p className="signUpButton" onClick={() => router.push('/login')}>
          ログインに戻る
        </p>
      </div>
    </div>
  )
}
