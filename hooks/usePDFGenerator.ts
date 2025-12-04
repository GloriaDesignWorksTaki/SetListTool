import React, { useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { SetlistItem } from '@/types'
import { SetlistDocument } from '@/components/pdf/SetlistDocument'
import { logger } from '@/utils/logger'
import { registerFonts } from '@/utils/fonts'

interface UsePDFGeneratorReturn {
  generatePDF: (params: {
    name: string
    date: string
    venue: string
    setlist: SetlistItem[]
    eventTitle: string
    logoUrl?: string
  }) => Promise<void>
}

/**
 * PDF生成を行うカスタムフック
 * @returns PDF生成関数
 */
export const usePDFGenerator = (): UsePDFGeneratorReturn => {
  const generatePDF = useCallback(async ({
    name,
    date,
    venue,
    setlist,
    eventTitle,
    logoUrl,
  }: {
    name: string
    date: string
    venue: string
    setlist: SetlistItem[]
    eventTitle: string
    logoUrl?: string
  }) => {
    try {
      logger.log('PDF生成開始...')

      // フォントを登録（PDF生成前に必要）
      registerFonts()

      // PDF生成（型エラー回避のため、動的にインポート）
      const { SetlistDocument: PDFDocument } = await import('@/components/pdf/SetlistDocument')
      const blob = await pdf(
        React.createElement(PDFDocument, {
          name,
          date,
          venue,
          setlist,
          eventTitle,
          logoUrl,
        }) as any
      ).toBlob()

      logger.log('Blob生成完了:', blob.size, 'bytes')

      // Blob URLを生成
      const url = URL.createObjectURL(blob)
      logger.log('Blob URL生成完了:', url)

      // デバイス判定
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      logger.log('デバイス判定:', isMobile ? 'モバイル' : 'デスクトップ')

      if (isMobile) {
        // スマホの場合は新しいウィンドウで開く
        logger.log('モバイル用: 新しいウィンドウでPDFを開きます')
        const newWindow = window.open(url, '_blank')
        if (!newWindow) {
          // ポップアップがブロックされた場合
          logger.log('ポップアップがブロックされました。同じウィンドウで開きます')
          window.location.href = url
        }
      } else {
        // デスクトップの場合は新しいタブで開く
        logger.log('デスクトップ用: 新しいタブでPDFを開きます')
        window.open(url, '_blank')
      }

      // メモリリーク防止のため、少し遅延してからURLを解放
      setTimeout(() => {
        URL.revokeObjectURL(url)
        logger.log('Blob URLを解放しました')
      }, 5000)
    } catch (error) {
      logger.error('PDF生成エラー:', error)
      throw error
    }
  }, [])

  return {
    generatePDF,
  }
}

