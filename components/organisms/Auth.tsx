'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import { AiOutlineLogin } from 'react-icons/ai'
import { useLocale } from '@/contexts/LocaleContext'
import type { MessageKey } from '@/i18n/messages'

interface AuthProps {
  disableAutoRedirect?: boolean
  notice?: {
    type: 'success' | 'error'
    textKey: MessageKey
    allowResend?: boolean
  } | null
}

export default function Auth({ disableAutoRedirect = false, notice = null }: AuthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [allowResend, setAllowResend] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [resendMessageType, setResendMessageType] = useState<'success' | 'error'>('success')
  const [resending, setResending] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { t } = useLocale()

  useEffect(() => {
    if (!disableAutoRedirect && status === 'authenticated') {
      router.replace('/')
    }
  }, [disableAutoRedirect, status, router])

  useEffect(() => {
    setAllowResend(Boolean(notice?.allowResend))
  }, [notice])

  const getRedirectUrl = (): string => {
    if (typeof window === 'undefined') return '/login?type=email'
    return `${window.location.origin}/login?type=email`
  }

  const handleResendConfirmationEmail = async () => {
    setResendMessage('')
    setResendMessageType('success')
    const targetEmail = email.trim()

    if (!targetEmail) {
      setResendMessage(t('auth.resendNeedEmail'))
      setResendMessageType('error')
      return
    }

    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (error) {
        setResendMessage(t('auth.resendFailed', { message: error.message }))
        setResendMessageType('error')
      } else {
        setResendMessage(t('auth.resendSuccess'))
        setResendMessageType('success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.unknownError')
      setResendMessage(t('auth.resendFailed', { message }))
      setResendMessageType('error')
    } finally {
      setResending(false)
    }
  }

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage(t('auth.emailRequiredBoth'))
      return
    }

    setLoading(true)
    setMessage('')
    setResendMessage('')
    setResendMessageType('success')
    setAllowResend(false)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        const err = result.error
        if (
          err.includes('Email not confirmed') ||
          err.toLowerCase().includes('email not confirmed')
        ) {
          setMessage(t('auth.emailNotConfirmed'))
          setAllowResend(true)
        } else if (
          err.includes('Invalid login credentials') ||
          err.toLowerCase().includes('invalid login credentials')
        ) {
          setMessage(t('auth.invalidCredentials'))
        } else if (err === 'CredentialsSignin') {
          setMessage(t('auth.invalidCredentials'))
        } else {
          setMessage(t('auth.loginError', { message: err }))
        }
      } else if (result?.ok) {
        router.push('/')
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('auth.unknownError')
      setMessage(t('auth.genericError', { message: msg }))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || session) {
    return null
  }

  return (
    <div className="auth">
      <div className="authForm">
        <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
        <div className="desc">
          <p>{t('auth.beta')}</p>
        </div>
        <h2>{t('auth.loginTitle')}</h2>

        {notice && (
          <div className={`authNotice ${notice.type === 'success' ? 'authNoticeSuccess' : 'authNoticeError'}`}>
            {t(notice.textKey)}
          </div>
        )}

        {message && (
          <div className="errorMessage">
            {message}
          </div>
        )}
        {allowResend && (
          <button
            type="button"
            className="linkButton"
            onClick={handleResendConfirmationEmail}
            disabled={resending}
          >
            {resending ? t('auth.resending') : t('auth.resendConfirm')}
          </button>
        )}
        {resendMessage && (
          <div className={`authNotice ${resendMessageType === 'success' ? 'authNoticeSuccess' : 'authNoticeError'}`}>
            {resendMessage}
          </div>
        )}

        <input
          type="email"
          placeholder={t('auth.email')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder={t('auth.password')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button
          onClick={handleAuth}
          disabled={loading}
          className={`submitButton ${loading ? 'loading' : ''}`}
        >
          {!loading && <AiOutlineLogin />}
          <span>{loading ? t('auth.processing') : t('auth.login')}</span>
        </button>

        <p className="signUpButton" onClick={() => router.push('/forgot-password')}>
          {t('auth.forgotLink')}
        </p>
        <p className="signUpButton" onClick={() => {
          router.push('/signup')
        }}>
          {t('auth.signupLink')}
        </p>
      </div>
    </div>
  )
}
