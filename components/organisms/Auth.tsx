'use client'

import { useState } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [showResendEmail, setShowResendEmail] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleAuth = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password')
      return
    }

    setLoading(true)
    setErrorMessage('')
    setShowResendEmail(false)

    try {
      if (isLogin) {
        // Login process
        let data: any = undefined, error: any = undefined;
        try {
          const result = await supabase.auth.signInWithPassword({ email, password });
          data = result.data;
          error = result.error;
        } catch (err: any) {
          console.error('Login try-catch error:', err);
          if (err?.message?.includes('Email not confirmed')) {
            setShowResendEmail(true);
            setErrorMessage('Email confirmation required. Please check your email and click the confirmation link.');
          } else {
            setErrorMessage(`Login error: ${err?.message || 'Unknown error'}`);
          }
          setLoading(false);
          return;
        }

        if (error === undefined && !data) return;

        if (error) {
          let message = 'Login failed'
          if (error.message.includes('Invalid login credentials')) {
            message = 'Invalid email or password'
          } else if (error.message.includes('Email not confirmed')) {
            message = 'Email confirmation required. Please check your email and click the confirmation link.'
            setShowResendEmail(true)
          } else {
            message = `Login error: ${error.message}`
          }
          setErrorMessage(message)
          console.error('Login error:', error)
        } else if (data?.user) {
          console.log('Login successful:', data.user)
          router.push('/')
        }
      } else {
        // Sign up process
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password 
        })

        if (error) {
          let message = 'Sign up failed'
          if (error.message.includes('User already registered')) {
            message = 'User already registered with this email'
          } else if (error.message.includes('Password should be at least')) {
            message = 'Password must be at least 6 characters'
          } else {
            message = `Sign up error: ${error.message}`
          }
          setErrorMessage(message)
          console.error('Signup error:', error)
        } else if (data?.user) {
          console.log('Signup successful:', data.user)
          setErrorMessage('Sign up successful. Please check your email for confirmation.')
          setIsLogin(true) // Switch to login mode
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      setErrorMessage(`Network error: ${errorMessage}. Please check your internet connection and try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) {
        setErrorMessage('Failed to resend confirmation email: ' + error.message)
        console.error('Resend error:', error)
      } else {
        setErrorMessage('Confirmation email sent! Please check your inbox.')
        setShowResendEmail(false)
      }
    } catch (error: any) {
      console.error('Resend error:', error)
      const errorMessage = error?.message || 'Unknown error occurred'
      setErrorMessage(`Network error: ${errorMessage}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <div className="authForm">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        
        {errorMessage && (
          <div 
            style={{
              padding: '10px',
              marginBottom: '15px',
              borderRadius: '4px',
              backgroundColor: errorMessage.includes('successful') ? '#d4edda' : '#f8d7da',
              color: errorMessage.includes('successful') ? '#155724' : '#721c24',
              border: `1px solid ${errorMessage.includes('successful') ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px',
              wordBreak: 'break-word'
            }}
          >
            {errorMessage}
          </div>
        )}
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
        
        {showResendEmail && (
          <button 
            onClick={handleResendEmail} 
            disabled={loading} 
            className="resendButton"
            style={{
              marginTop: '10px',
              backgroundColor: '#4a90e2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? 'Sending...' : 'Resend Confirmation Email'}
          </button>
        )}
        
        <p className="signUpButton" onClick={() => {
          setIsLogin(!isLogin)
          setShowResendEmail(false)
          setErrorMessage('')
        }}>
          {isLogin ? 'Sign Up Here' : 'Login Here'}
        </p>
      </div>
    </div>
  )
}