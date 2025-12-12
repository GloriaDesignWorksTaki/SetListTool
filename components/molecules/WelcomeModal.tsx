"use client"

import React from 'react'
import { Modal } from '@/components/atoms/Modal'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome!">
      <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
        ようこそ！サインアップが完了しました。
      </p>
      <p style={{ fontSize: '0.9rem', color: '#666' }}>
        ログインしてサービスをご利用ください。
      </p>
    </Modal>
  )
}