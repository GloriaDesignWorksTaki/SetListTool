'use client'

import React, { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string | null
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
}) => {
  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // モーダルが開いているときは背景のスクロールを無効化
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !pdfUrl) return null

  return (
    <div className="pdf-preview-modal-overlay" onClick={onClose}>
      <div
        className="pdf-preview-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="pdf-preview-modal-header">
          <h2 className="pdf-preview-modal-title">PDF Preview</h2>
          <button
            className="pdf-preview-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* PDF表示エリア */}
        <div className="pdf-preview-modal-body">
          <iframe
            src={pdfUrl}
            className="pdf-preview-modal-iframe"
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  )
}

