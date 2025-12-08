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
      registerFonts()

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

      const url = URL.createObjectURL(blob)
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

