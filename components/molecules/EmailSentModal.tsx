"use client"

import React from 'react'
import { Modal } from '@/components/atoms/Modal'

interface EmailSentModalProps {
  isOpen: boolean
  onClose: () => void
  email: string
}

export const EmailSentModal: React.FC<EmailSentModalProps> = ({ isOpen, onClose, email }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          記載のメールアドレスに確認メールを送りました
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
          {email}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          メール内のリンクをクリックして、アカウントを有効化してください。
        </p>
      </div>
    </Modal>
  )
}
