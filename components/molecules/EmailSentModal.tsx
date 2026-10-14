"use client"

import React, { useState } from 'react'
import { Modal } from '@/components/atoms/Modal'
import { supabase } from '@/utils/supabaseClient'
import { useLocale } from '@/contexts/LocaleContext'

interface EmailSentModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const EmailSentModal: React.FC<EmailSentModalProps> = ({ isOpen, onClose, email }) => {
  const { t } = useLocale()
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState('')

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
        setResendError(t('auth.emailResendFailed'))
        setResending(false)
        return
      }

      setResendSuccess(true)
      setResending(false)
    } catch {
      setResendError(t('auth.emailResendFailed'))
      setResending(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          {resendSuccess ? t('auth.emailSentResentTitle') : t('auth.emailSentTitle')}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
          {email}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
          {t('auth.emailSentBody')}
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
          <span>{resending ? t('auth.sending') : t('auth.resendEmail')}</span>
        </button>
      </div>
    </Modal>
  )
}
