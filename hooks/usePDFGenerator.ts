import React, { useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { SetlistItem } from '@/types'
import { SetlistDocument } from '@/components/pdf/SetlistDocument'

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
 * 
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
      console.log('PDF生成開始...')
      
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

      console.log('Blob生成完了:', blob.size, 'bytes')

      // Blob URLを生成
      const url = URL.createObjectURL(blob)
      console.log('Blob URL生成完了:', url)

      // デバイス判定
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      console.log('デバイス判定:', isMobile ? 'モバイル' : 'デスクトップ')

      if (isMobile) {
        // スマホの場合は新しいウィンドウで開く
        console.log('モバイル用: 新しいウィンドウでPDFを開きます')
        const newWindow = window.open(url, '_blank')
        if (!newWindow) {
          // ポップアップがブロックされた場合
          console.log('ポップアップがブロックされました。同じウィンドウで開きます')
          window.location.href = url
        }
      } else {
        // デスクトップの場合は新しいタブで開く
        console.log('デスクトップ用: 新しいタブでPDFを開きます')
        window.open(url, '_blank')
      }

      // メモリリーク防止のため、少し遅延してからURLを解放
      setTimeout(() => {
        URL.revokeObjectURL(url)
        console.log('Blob URLを解放しました')
      }, 5000)
    } catch (error) {
      console.error('PDF生成エラー:', error)
      throw error
    }
  }, [])

  return {
    generatePDF,
  }
}

