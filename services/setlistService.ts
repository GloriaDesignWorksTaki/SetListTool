import { SetlistItem } from '@/types'
import { logger } from '@/utils/logger'

export type SetlistRecord = {
  id: string
  band_id: string
  user_id: string
  items: SetlistItem[]
  event_date: string | null
  venue: string | null
  event_title: string | null
  updated_at?: string
}

export type SetlistPayload = {
  items: SetlistItem[]
  eventDate: string
  venue: string
  eventTitle: string
}

/**
 * セットリスト永続化サービス（API Route経由）
 * NextAuth セッションで認可し、Service Role で DB 書き込みする
 */
export const setlistService = {
  async fetchByBandId(bandId: string): Promise<SetlistRecord | null> {
    try {
      const response = await fetch(`/api/setlist?bandId=${encodeURIComponent(bandId)}`)
      const data = (await response.json().catch(() => ({}))) as {
        setlist?: SetlistRecord | null
        error?: string
        code?: string
      }

      if (response.status === 503 || data.code === 'missing_table') {
        logger.error('setlists テーブル未作成。マイグレーションを実行してください。', data)
        return null
      }

      if (!response.ok) {
        logger.error('セットリスト取得失敗:', data)
        return null
      }

      const record = data.setlist
      if (!record) return null

      return {
        ...record,
        items: Array.isArray(record.items) ? record.items : [],
      }
    } catch (error) {
      logger.error('セットリスト取得エラー:', error)
      return null
    }
  },

  async upsert(bandId: string, userId: string, payload: SetlistPayload): Promise<void> {
    // userId は API 側でも session から検証する
    try {
      const response = await fetch('/api/setlist', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bandId,
          userId,
          items: payload.items,
          eventDate: payload.eventDate,
          venue: payload.venue,
          eventTitle: payload.eventTitle,
        }),
      })

      const data = (await response.json().catch(() => ({}))) as {
        error?: string
        code?: string
      }

      if (response.status === 503 || data.code === 'missing_table') {
        logger.error('setlists テーブル未作成。マイグレーションを実行してください。', data)
        return
      }

      if (!response.ok) {
        // UI を落とさない。sessionStorage には既に保存済み
        logger.error('セットリスト保存失敗:', {
          status: response.status,
          error: data.error || 'unknown',
          code: data.code,
        })
        return
      }
    } catch (error) {
      logger.error('セットリスト保存エラー:', error)
      // throw しない（操作自体はローカルに残す）
    }
  },
}
