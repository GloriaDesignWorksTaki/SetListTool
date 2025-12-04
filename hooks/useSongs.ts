import { useState, useEffect, useCallback } from 'react'
import { songService } from '@/services/songService'
import { Song } from '@/types'
import { logger } from '@/utils/logger'

interface UseSongsReturn {
  songs: Song[]
  loading: boolean
  addSong: (title: string) => Promise<void>
  deleteSong: (title: string) => Promise<void>
  refreshSongs: () => Promise<void>
}

/**
 * 曲の管理を行うカスタムフック
 * 
 * @param bandId - バンドID
 * @returns 曲のリスト、ローディング状態、追加・削除関数
 */
export const useSongs = (bandId: string | null): UseSongsReturn => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  // データベースから曲を読み込み
  const loadSongsFromDB = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!bandId) {
        logger.log('バンドIDが見つからないため、データベースからの読み込みをスキップ')
        setSongs([])
        setLoading(false)
        return
      }

      const dbSongs = await songService.fetchAll(bandId)
      setSongs(dbSongs || [])
      
      setLoading(false)
    } catch (error) {
      logger.error("曲の読み込みエラー:", error)
      setSongs([])
      setLoading(false)
    }
  }, [bandId])

  // Supabaseへの登録処理
  const addSongToDB = useCallback(async (title: string) => {
    try {
      if (!bandId) {
        logger.error('バンドIDが見つかりません。先にバンド名を設定してください。')
        return
      }

      await songService.create(title, bandId)
      logger.log("曲をデータベースに保存しました:", title)
    } catch (error) {
      logger.error("曲の保存エラー:", error)
    }
  }, [bandId])

  // データベースから曲を削除
  const deleteSongFromDB = useCallback(async (title: string) => {
    try {
      if (!bandId) {
        logger.error('バンドIDが見つかりません')
        return
      }

      await songService.delete(title, bandId)
      logger.log("曲をデータベースから削除しました:", title)
    } catch (error) {
      logger.error("曲の削除エラー:", error)
    }
  }, [bandId])

  // 曲を追加
  const addSong = useCallback(async (title: string) => {
    // 重複チェック
    if (songs.some(song => song.title === title)) {
      logger.warn('同じ名前の曲がすでに存在します:', title)
      return
    }

    setSongs((prevSongs) => [...prevSongs, { id: `new-${Date.now()}`, title, band_id: bandId || '' }])
    await addSongToDB(title)
    await loadSongsFromDB() // データベースから最新のリストを再取得
  }, [songs, bandId, addSongToDB, loadSongsFromDB])

  // 曲を削除
  const deleteSong = useCallback(async (title: string) => {
    setSongs((prevSongs) => prevSongs.filter((song) => song.title !== title))
    await deleteSongFromDB(title)
    await loadSongsFromDB() // データベースから最新のリストを再取得
  }, [deleteSongFromDB, loadSongsFromDB])

  // 初回レンダリング時に曲を読み込み
  useEffect(() => {
    loadSongsFromDB()
  }, [loadSongsFromDB])

  return {
    songs,
    loading,
    addSong,
    deleteSong,
    refreshSongs: loadSongsFromDB,
  }
}

