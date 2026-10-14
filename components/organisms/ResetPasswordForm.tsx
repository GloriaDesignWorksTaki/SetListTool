'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'
import { validatePassword, validatePasswordConfirmation } from '@/utils/validation'
import { useLocale } from '@/contexts/LocaleContext'

export default function ResetPasswordForm() {
  const router = useRouter()
  const { t } = useLocale()
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
          setError(isExpired ? t('auth.resetLinkExpired') : t('auth.resetLinkInvalid'))
          setPreparing(false)
          return
        }

        const type = hashType || queryType
        const accessToken = hashAccessToken || queryAccessToken
        const refreshToken = hashRefreshToken || queryRefreshToken

        if (queryCode) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(queryCode)
          if (exchangeError) {
            setError(t('auth.resetSessionFailed'))
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
            setError(t('auth.resetSessionFailed'))
            setPreparing(false)
            return
          }
          setReady(true)
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession()
          if (session) {
            setReady(true)
          } else {
            setError(t('auth.resetLinkInvalid'))
          }
        }

        window.history.replaceState(null, '', '/reset-password')
      } catch {
        setError(t('auth.resetPrepareFailed'))
      } finally {
        setPreparing(false)
      }
    }

    void prepareSession()
    // 初回マウント時のみ。locale 変更では再実行しない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      setError(
        passwordValidation.errorKey ? t(passwordValidation.errorKey) : t('validation.passwordRequired')
      )
      return
    }

    const confirmValidation = validatePasswordConfirmation(password, confirmPassword)
    if (!confirmValidation.isValid) {
      setError(
        confirmValidation.errorKey
          ? t(confirmValidation.errorKey)
          : t('validation.passwordConfirmRequired')
      )
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(t('auth.resetUpdateFailed', { message: updateError.message }))
        return
      }

      await supabase.auth.signOut({ scope: 'local' })
      setSuccess(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unknownError')
      setError(t('auth.resetUpdateFailed', { message }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
        <h2>{t('auth.resetTitle')}</h2>

        {preparing && <p className="desc">{t('auth.preparing')}</p>}

        {error && <div className="errorMessage">{error}</div>}

        {success ? (
          <>
            <div className="authNotice authNoticeSuccess">
              {t('auth.resetSuccess')}
            </div>
            <button
              type="button"
              className="submitButton"
              onClick={() => router.push('/login')}
            >
              <span>{t('auth.goToLogin')}</span>
            </button>
          </>
        ) : (
          ready &&
          !preparing && (
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                className="input"
                placeholder={t('auth.newPassword')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <input
                type="password"
                className="input"
                placeholder={t('auth.newPasswordConfirm')}
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
                <span>{loading ? t('auth.updating') : t('auth.updatePassword')}</span>
              </button>
            </form>
          )
        )}

        {!success && (
          <p className="signUpButton" onClick={() => router.push('/forgot-password')}>
            {t('auth.resendReset')}
          </p>
        )}
        <p className="signUpButton" onClick={() => router.push('/login')}>
          {t('auth.loginLink')}
        </p>
      </div>
    </div>
  )
}
