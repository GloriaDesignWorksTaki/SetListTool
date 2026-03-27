'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/router'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import { AiOutlineLogin } from 'react-icons/ai'

interface AuthProps {
  disableAutoRedirect?: boolean
  notice?: {
    type: 'success' | 'error'
    text: string
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
      setResendMessage('再送するメールアドレスを入力してください。')
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
        setResendMessage(`確認メールの再送に失敗しました: ${error.message}`)
        setResendMessageType('error')
      } else {
        setResendMessage('確認メールを再送しました。メールをご確認ください。')
        setResendMessageType('success')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー'
      setResendMessage(`確認メールの再送に失敗しました: ${message}`)
      setResendMessageType('error')
    } finally {
      setResending(false)
    }
  }

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    setMessage('')
    setResendMessage('')
    setResendMessageType('success')
    setAllowResend(false)

    try {
      // NextAuthを使用してログイン
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('Email not confirmed')) {
          setMessage('メール確認が必要です。メールを確認してください。')
          setAllowResend(true)
        } else if (result.error.includes('Invalid login credentials')) {
          setMessage('メールアドレスまたはパスワードが正しくありません')
        } else {
          setMessage(`ログインエラー: ${result.error}`)
        }
      } else if (result?.ok) {
        router.push('/')
      }
    } catch (error: any) {
      setMessage(`エラーが発生しました: ${error.message}`)
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
          <p>Setlist Maker β Version 0.99.000</p>
        </div>
        <h2>ログイン</h2>

        {notice && (
          <div className={`authNotice ${notice.type === 'success' ? 'authNoticeSuccess' : 'authNoticeError'}`}>
            {notice.text}
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
            {resending ? '再送中...' : '確認メールを再送する'}
          </button>
        )}
        {resendMessage && (
          <div className={`authNotice ${resendMessageType === 'success' ? 'authNoticeSuccess' : 'authNoticeError'}`}>
            {resendMessage}
          </div>
        )}

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="パスワード"
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
          <span>{loading ? '処理中...' : 'ログイン'}</span>
        </button>

        <p className="signUpButton" onClick={() => {
          router.push('/signup')
        }}>
          サインアップはこちら
        </p>
      </div>
    </div>
  )
}