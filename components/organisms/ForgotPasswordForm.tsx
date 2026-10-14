'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'
import { validateEmail } from '@/utils/validation'
import { useLocale } from '@/contexts/LocaleContext'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const { t } = useLocale()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/reset-password'
    return `${window.location.origin}/reset-password`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validation = validateEmail(email)
    if (!validation.isValid) {
      setError(validation.errorKey ? t(validation.errorKey) : t('validation.emailRequired'))
      return
    }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectUrl(),
      })

      if (resetError) {
        setError(t('auth.resetSendFailed', { message: resetError.message }))
        return
      }

      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('auth.unknownError')
      setError(t('auth.resetSendFailed', { message }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
        <h2>{t('auth.forgotTitle')}</h2>
        <p className="desc">
          {t('auth.forgotDesc')}
        </p>

        {error && <div className="errorMessage">{error}</div>}

        {sent ? (
          <div className="authNotice authNoticeSuccess">
            {t('auth.resetSent')}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="input"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            <button
              type="submit"
              className={`submitButton ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span>{loading ? t('auth.sending') : t('auth.sendResetEmail')}</span>
            </button>
          </form>
        )}

        <p className="signUpButton" onClick={() => router.push('/login')}>
          {t('auth.loginLink')}
        </p>
      </div>
    </div>
  )
}
