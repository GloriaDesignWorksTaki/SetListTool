"use client"

import React from 'react'
import { Modal } from '@/components/atoms/Modal'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="プライバシーポリシー">
      <div style={{ textAlign: 'left', maxHeight: '60vh', overflowY: 'auto' }}>
        <p style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
          最終更新日: {new Date().toLocaleDateString('ja-JP')}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>1. はじめに</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            本プライバシーポリシーは、Setlist Maker（以下「当サービス」）における個人情報の取り扱いについて説明するものです。
            当サービスをご利用いただく際には、本ポリシーに同意していただく必要があります。
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>2. 収集する情報</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
            当サービスでは、以下の情報を収集する場合があります：
          </p>
          <ul style={{ fontSize: '0.9rem', lineHeight: '1.6', marginLeft: '1.5rem' }}>
            <li>メールアドレス</li>
            <li>パスワード（暗号化して保存）</li>
            <li>バンド名</li>
            <li>バンドジャンル</li>
            <li>その他、サービス提供に必要な情報</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>3. 情報の利用目的</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
            収集した情報は、以下の目的で利用します：
          </p>
          <ul style={{ fontSize: '0.9rem', lineHeight: '1.6', marginLeft: '1.5rem' }}>
            <li>サービスの提供・運営</li>
            <li>ユーザー認証</li>
            <li>お問い合わせへの対応</li>
            <li>サービス改善のための分析</li>
          </ul>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>4. 情報の管理</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            当サービスは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して適切なセキュリティ対策を講じます。
          </p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>5. 第三者への提供</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            当サービスは、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
          </p>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>6. お問い合わせ</h3>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            プライバシーポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
          </p>
        </div>
      </div>
    </Modal>
  )
}
