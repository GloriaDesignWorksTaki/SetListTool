'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { supabase } from '@/utils/supabaseClient'
import { validateEmail } from '@/utils/validation'

export default function ForgotPasswordForm() {
  const router = useRouter()
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
      setError(validation.error || 'メールアドレスを確認してください')
      return
    }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectUrl(),
      })

      if (resetError) {
        setError(`送信に失敗しました: ${resetError.message}`)
        return
      }

      // セキュリティ上、存在有無に関わらず同じ成功表示
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '不明なエラー'
      setError(`送信に失敗しました: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
        <h2>パスワード再設定</h2>
        <p className="desc">
          登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。
        </p>

        {error && <div className="errorMessage">{error}</div>}

        {sent ? (
          <div className="authNotice authNoticeSuccess">
            再設定用メールを送信しました。メール内のリンクから新しいパスワードを設定してください。
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className="input"
              placeholder="メールアドレス"
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
              <span>{loading ? '送信中...' : '再設定メールを送る'}</span>
            </button>
          </form>
        )}

        <p className="signUpButton" onClick={() => router.push('/login')}>
          ログインに戻る
        </p>
      </div>
    </div>
  )
}
