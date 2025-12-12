'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'
import { EmailSentModal } from '@/components/molecules/EmailSentModal'
import { PrivacyPolicyModal } from '@/components/molecules/PrivacyPolicyModal'
import { validateSignupForm, type SignupFormData } from '@/utils/validation'

export default function SignupForm() {
  const [bandName, setBandName] = useState('')
  const [genre, setGenre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [privacyAgreed, setPrivacyAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmailSentModal, setShowEmailSentModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const router = useRouter()

  const validateForm = (): boolean => {
    const formData: SignupFormData = {
      bandName,
      genre,
      email,
      password,
      confirmPassword,
      privacyAgreed,
    }

    const result = validateSignupForm(formData)
    if (!result.isValid && result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Supabaseでユーザー登録（user_metadataにバンド情報を保存）
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            band_name: bandName,
            genre: genre || null,
          },
          emailRedirectTo: `${window.location.origin}/login?type=email`,
        },
      })

      // エラーチェック
      if (authError) {
        setLoading(false)

        const message = authError.message?.toLowerCase?.() ?? ''
        const code = (authError as any).code ?? (authError as any).status ?? ''

        // === 重複メールアドレス判定 ===
        if (
          message === 'user already registered'.toLowerCase() ||
          message.includes('user already registered') ||
          code === 'user_already_registered'
        ) {
          const msg = 'すでに利用されているメールアドレスです'
          setError(msg)
          // 必要であればブラウザのアラートも表示
          // window.alert(msg)
          return
        }

        // その他のエラー（開発時のみ debug 情報を表示）
        const debugInfo =
          process.env.NODE_ENV === 'development'
            ? ` (code: ${code || 'unknown'})`
            : ''
        setError(`サインアップエラー: ${authError.message}${debugInfo}`)
        return
      }

      // authError が無いのに user が返ってこない場合も念のためエラー扱い
      if (!authData || !authData.user) {
        setLoading(false)
        setError('サインアップに失敗しました。時間をおいて再度お試しください。')
        return
      }

      // 成功時：メール送信確認モーダルを表示
      setLoading(false)
      setShowEmailSentModal(true)
    } catch (error: any) {
      setLoading(false)
      setError(`エラーが発生しました: ${error.message ?? '不明なエラー'}`)
    }
  }

  const handleEmailSentModalClose = () => {
    setShowEmailSentModal(false)
    // ログインページにリダイレクト
    router.push('/login')
  }

  return (
    <>
      <div className="auth">
        <div className="authForm">
          <Image src="/img/logo.webp" alt="logo" width={60} height={60} />
          <h2>サインアップ</h2>

          {error && (
            <div className="errorMessage">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="バンド名*"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              className="input"
              disabled={loading}
            />
            <input
              type="text"
              placeholder="バンドのジャンル"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="input"
              disabled={loading}
            />
            <input
              type="email"
              placeholder="メールアドレス*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="パスワード*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              disabled={loading}
            />
            <input
              type="password"
              placeholder="パスワード再入力*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              disabled={loading}
            />

            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  disabled={loading}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem' }}>
                  <span
                    onClick={(e) => {
                      e.preventDefault()
                      setShowPrivacyModal(true)
                    }}
                    style={{ color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    プライバシーポリシー
                  </span>
                  に同意する*
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`submitButton ${loading ? 'loading' : ''}`}
            >
              <span>{loading ? '処理中...' : '送信'}</span>
            </button>
          </form>

          <p className="signUpButton" onClick={() => router.push('/login')}>
            ログインはこちら
          </p>
        </div>
      </div>

      <EmailSentModal
        isOpen={showEmailSentModal}
        onClose={handleEmailSentModalClose}
        email={email}
      />
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </>
  )
}