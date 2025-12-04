import { supabase } from '@/pages/api/supabaseClient'
import { Song } from '@/types'
import { logger } from '@/utils/logger'

/**
 * 曲に関するデータアクセスサービス
 */
export const songService = {
  /**
   * バンドIDに紐づくすべての曲を取得
   * @param bandId - バンドID
   * @returns 曲の配列
   */
  async fetchAll(bandId: string): Promise<Song[]> {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('id, title, band_id')
        .eq('band_id', bandId)
        .order('created_at', { ascending: true })

      if (error) {
        logger.error('曲の取得エラー:', error)
        throw new Error(`曲の取得に失敗しました: ${error.message}`)
      }

      return data || []
    } catch (error) {
      logger.error('曲の取得エラー:', error)
      throw error
    }
  },

  /**
   * 曲を追加
   * @param title - 曲のタイトル
   * @param bandId - バンドID
   * @returns 追加された曲
   */
  async create(title: string, bandId: string): Promise<Song> {
    try {
      const { data, error } = await supabase
        .from('songs')
        .insert([{ title, band_id: bandId }])
        .select('id, title')
        .single()

      if (error) {
        logger.error('曲の追加エラー:', error)
        throw new Error(`曲の追加に失敗しました: ${error.message}`)
      }

      if (!data) {
        throw new Error('曲の追加に失敗しました: データが返されませんでした')
      }

      return data
    } catch (error) {
      logger.error('曲の追加エラー:', error)
      throw error
    }
  },

  /**
   * 曲を削除
   * @param title - 曲のタイトル
   * @param bandId - バンドID
   */
  async delete(title: string, bandId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('songs')
        .delete()
        .eq('title', title)
        .eq('band_id', bandId)

      if (error) {
        logger.error('曲の削除エラー:', error)
        throw new Error(`曲の削除に失敗しました: ${error.message}`)
      }
    } catch (error) {
      logger.error('曲の削除エラー:', error)
      throw error
    }
  },
}

