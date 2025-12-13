'use client'

import React, { useEffect } from 'react'
import { FiX, FiDownload } from 'react-icons/fi'

interface PDFPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  pdfUrl: string | null
  fileName?: string
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  fileName = 'setlist.pdf',
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

  // スマホ・タブレット判定
  const isMobileOrTablet = () => {
    if (typeof window === 'undefined') return false
    return window.innerWidth <= 1024 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Web Share APIでシェアシートを表示
  const handleShare = async () => {
    if (!pdfUrl) return

    // スマホ・タブレットかつWeb Share APIが利用可能な場合
    if (isMobileOrTablet() && navigator.share) {
      try {
        // Blob URLからファイルを取得
        const response = await fetch(pdfUrl)
        const blob = await response.blob()
        const file = new File([blob], fileName, { type: 'application/pdf' })

        // Web Share APIでシェアシートを表示
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: fileName,
          })
        } else {
          // ファイルシェアがサポートされていない場合は通常のダウンロード
          downloadPDF()
        }
      } catch (error) {
        // ユーザーがキャンセルした場合などはエラーを無視
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error)
          // エラー時は通常のダウンロードにフォールバック
          downloadPDF()
        }
      }
    } else {
      // デスクトップまたはWeb Share APIが利用できない場合は通常のダウンロード
      downloadPDF()
    }
  }

  // 通常のダウンロード処理
  const downloadPDF = () => {
    if (!pdfUrl) return

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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
          <div className="pdf-preview-modal-header-actions">
            <button
              className="pdf-preview-modal-download"
              onClick={(e) => {
                e.stopPropagation()
                handleShare()
              }}
              aria-label="Download"
            >
              <FiDownload size={20} />
            </button>
            <button
              className="pdf-preview-modal-close"
              onClick={onClose}
              aria-label="Close"
            >
              <FiX size={24} />
            </button>
          </div>
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

