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
  }) => Promise<string> // Blob URLを返す
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

      // Blob URLを返す（モーダルで使用）
      return url
    } catch (error) {
      logger.error('PDF生成エラー:', error)
      throw error
    }
  }, [])

  return {
    generatePDF,
  }
}

