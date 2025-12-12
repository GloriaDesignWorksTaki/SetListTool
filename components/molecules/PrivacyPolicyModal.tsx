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
      <div className="privacy-policy-modal-content">
        <p className="privacy-policy-modal-update-date">最終更新日: {new Date().toLocaleDateString('ja-JP')}</p>
        <div className="privacy-policy-modal-section">
          <h3>1. はじめに</h3>
          <p>
            本プライバシーポリシーは、Setlist Maker（以下「当サービス」）における個人情報の取り扱いについて説明するものです。
            当サービスをご利用いただく際には、本ポリシーに同意していただく必要があります。
          </p>
        </div>
        <div className="privacy-policy-modal-section">
          <h3>2. 収集する情報</h3>
          <p>
            当サービスでは、以下の情報を収集する場合があります：
          </p>
          <ul>
            <li>メールアドレス</li>
            <li>パスワード（暗号化して保存）</li>
            <li>バンド名</li>
            <li>バンドジャンル</li>
            <li>その他、サービス提供に必要な情報</li>
          </ul>
        </div>
        <div className="privacy-policy-modal-section">
          <h3>3. 情報の利用目的</h3>
          <p>
            収集した情報は、以下の目的で利用します：
          </p>
          <ul>
            <li>サービスの提供・運営</li>
            <li>ユーザー認証</li>
            <li>お問い合わせへの対応</li>
            <li>サービス改善のための分析</li>
          </ul>
        </div>
        <div className="privacy-policy-modal-section">
          <h3>4. 情報の管理</h3>
          <p>
            当サービスは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して適切なセキュリティ対策を講じます。
          </p>
        </div>
        <div className="privacy-policy-modal-section">
          <h3>5. 第三者への提供</h3>
          <p>
            当サービスは、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
          </p>
        </div>
      </div>
    </Modal>
  )
}



