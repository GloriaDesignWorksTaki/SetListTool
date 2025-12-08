import { supabase } from '@/pages/api/supabaseClient'
import { Band } from '@/types'
import { logger } from '@/utils/logger'

/**
 * バンドに関するデータアクセスサービス
 */
export const bandService = {
  /**
   * ユーザーIDからバンドIDを取得
   * @param userId - ユーザーID
   * @returns バンドID（存在しない場合はnull）
   */
  async getBandId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        logger.error('バンドID取得エラー:', error)
        throw new Error(`バンドID取得に失敗しました: ${error.message}`)
      }

      return data?.id || null
    } catch (error) {
      logger.error('バンドID取得エラー:', error)
      throw error
    }
  },

  /**
   * バンド情報を取得
   * @param userId - ユーザーID
   * @returns バンド情報（存在しない場合はnull）
   */
  async getBandByUserId(userId: string): Promise<Band | null> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        logger.error('認証エラー:', authError)
        throw new Error(`認証が必要です: ${authError?.message || 'ユーザーが取得できませんでした'}`)
      }

      const { data, error } = await supabase
        .from('bands')
        .select('id, name, logo_url, user_id, created_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        logger.error('バンド情報取得エラー:', error)
        
        if (error.code === '42703' || error.code === '42P01') {
          return null
        }
        
        if (error.code === 'PGRST116') {
          return null
        }
        
        throw new Error(`バンド情報取得に失敗しました: ${error.message} (code: ${error.code})`)
      }

      return data || null
    } catch (error) {
      logger.error('バンド情報取得エラー:', error)
      throw error
    }
  },

  /**
   * バンドIDからバンド情報を取得
   * @param bandId - バンドID
   * @returns バンド情報
   */
  async getBandById(bandId: string): Promise<Band | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('id, name, logo_url, user_id, created_at')
        .eq('id', bandId)
        .single()

      if (error) {
        logger.error('バンド情報取得エラー:', error)
        if (error.code === 'PGRST116') {
          return null
        }
        throw new Error(`バンド情報取得に失敗しました: ${error.message}`)
      }

      return data || null
    } catch (error) {
      logger.error('バンド情報取得エラー:', error)
      throw error
    }
  },

  /**
   * バンドを作成
   * @param userId - ユーザーID
   * @param name - バンド名
   * @param logoUrl - ロゴURL（オプション）
   * @returns 作成されたバンド
   */
  async create(userId: string, name: string, logoUrl?: string): Promise<Band> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .insert([
          {
            user_id: userId,
            name,
            logo_url: logoUrl,
          },
        ])
        .select('id, name, logo_url, user_id, created_at')
        .single()

      if (error) {
        logger.error('バンド作成エラー:', error)
        throw new Error(`バンド作成に失敗しました: ${error.message}`)
      }

      if (!data) {
        throw new Error('バンド作成に失敗しました: データが返されませんでした')
      }

      return data
    } catch (error) {
      logger.error('バンド作成エラー:', error)
      throw error
    }
  },

  /**
   * バンド情報を更新
   * @param bandId - バンドID
   * @param updates - 更新する情報
   */
  async update(
    bandId: string,
    updates: { name?: string; logo_url?: string }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('bands')
        .update(updates)
        .eq('id', bandId)

      if (error) {
        logger.error('バンド更新エラー:', error)
        throw new Error(`バンド更新に失敗しました: ${error.message}`)
      }
    } catch (error) {
      logger.error('バンド更新エラー:', error)
      throw error
    }
  },

  /**
   * バンド名を取得
   * @param userId - ユーザーID
   * @returns バンド名（存在しない場合はnull）
   */
  async getBandName(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        logger.error('バンド名取得エラー:', error)
        return null
      }

      return data?.name || null
    } catch (error) {
      logger.error('バンド名取得エラー:', error)
      return null
    }
  },

  /**
   * バンドのロゴURLを取得
   * @param bandId - バンドID
   * @returns ロゴURL（存在しない場合はnull）
   */
  async getLogoUrl(bandId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('bands')
        .select('logo_url')
        .eq('id', bandId)
        .single()

      if (error) {
        // logo_urlカラムが存在しない場合は無視
        if (error.code === '42703') {
          return null
        }
        logger.error('ロゴURL取得エラー:', error)
        return null
      }

      return data?.logo_url || null
    } catch (error) {
      logger.error('ロゴURL取得エラー:', error)
      return null
    }
  },
}

