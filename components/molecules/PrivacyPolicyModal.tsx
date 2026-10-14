"use client"

import React from 'react'
import { Modal } from '@/components/atoms/Modal'
import { PrivacyPolicyContent } from '@/components/molecules/PrivacyPolicyContent'
import { useLocale } from '@/contexts/LocaleContext'

interface PrivacyPolicyModalProps {
  isOpen: boolean
  onClose: () => void
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLocale()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('privacy.title')}>
      <PrivacyPolicyContent
        variant="short"
        headingLevel="h3"
        className="privacy-policy-modal-content"
        updateDateClassName="privacy-policy-modal-update-date"
        sectionClassName="privacy-policy-modal-section"
      />
    </Modal>
  )
}
