'use client'

import { useState } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'
import Image from 'next/image'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  const handleAuth = async () => {
    setLoading(true)
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })

    if (error) {
      let errorMessage = 'login failed'
      if (error.message.includes('invalid email')) {
        errorMessage = 'invalid email'
      } else if (error.message.includes('invalid password')) {
        errorMessage = 'invalid password'
      } else if (error.message.includes('user not found')) {
        errorMessage = 'user not found'
      }
      alert(errorMessage)
    } else {
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="auth">
      <div className="authForm">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button onClick={handleAuth} disabled={loading} className="submitButton">
          {loading ? 'Loading...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', marginTop: 12 }}>
          {isLogin ? 'Sign Up' : 'Login'}
        </p>
      </div>
    </div>
  )
}