'use client'

import { useState } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    if (!email || !password) {
      setMessage('メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        // ログイン
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setMessage('メール確認が必要です。メールを確認してください。')
          } else if (error.message.includes('Invalid login credentials')) {
            setMessage('メールアドレスまたはパスワードが正しくありません')
          } else {
            setMessage(`ログインエラー: ${error.message}`)
          }
        } else if (data.user) {
          router.push('/')
        }
      } else {
        // サインアップ
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })

        if (error) {
          if (error.message.includes('User already registered')) {
            setMessage('このメールアドレスは既に登録されています')
          } else {
            setMessage(`サインアップエラー: ${error.message}`)
          }
        } else if (data.user) {
          setMessage('サインアップが完了しました。メールを確認してください。')
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      setMessage(`エラーが発生しました: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <h2>{isLogin ? 'ログイン' : 'サインアップ'}</h2>
        
        {message && (
          <div className="errorMessage">
            {message}
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
        <button onClick={handleAuth} disabled={loading} className="submitButton">
          {loading ? '処理中...' : isLogin ? 'ログイン' : 'サインアップ'}
        </button>
        
        <p className="signUpButton" onClick={() => {
          setIsLogin(!isLogin)
          setMessage('')
        }}>
          {isLogin ? 'サインアップはこちら' : 'ログインはこちら'}
        </p>
      </div>
    </div>
  )
}