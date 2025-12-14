"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { supabase } from '@/utils/supabaseClient'

interface EmailSentModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const EmailSentModal: React.FC<EmailSentModalProps> = ({ isOpen, onClose, email }) => {
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

  // リダイレクトURLを取得（実行時のwindow.location.originを使用）
  const getRedirectUrl = (): string => {
    if (typeof window === 'undefined') return '/login?type=email'
    return `${window.location.origin}/login?type=email`
  }

  const handleResend = async () => {
    setResending(true)
    setResendSuccess(false)
    setResendError('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: getRedirectUrl(),
        },
      })

      if (error) {
        setResendError('メールの再送に失敗しました。時間をおいて再度お試しください。')
        setResending(false)
        return
      }

      setResendSuccess(true)
      setResending(false)
    } catch (error: any) {
      setResendError('メールの再送に失敗しました。時間をおいて再度お試しください。')
      setResending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          {resendSuccess ? '確認メールを再送しました' : '記載のメールアドレスに確認メールを送りました'}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
          {email}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>

        {resendError && (
          <p style={{ fontSize: '0.9rem', color: 'var(--error-text)', marginBottom: '1rem' }}>
            {resendError}
          </p>
        )}

        <button
          onClick={handleResend}
          disabled={resending}
          className={`submitButton ${resending ? 'loading' : ''}`}
          style={{ marginTop: '1rem' }}
        >
          <span>{resending ? '送信中...' : 'メールを再送する'}</span>
        </button>
      </div>
    </Modal>
  )
}
