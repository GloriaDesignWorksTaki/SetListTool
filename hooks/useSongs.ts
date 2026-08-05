import { useState, useEffect, useCallback } from 'react'
import { songService } from '@/services/songService'
import { Song } from '@/types'
import { logger } from '@/utils/logger'

interface UseSongsReturn {
  songs: Song[]
  loading: boolean
  addSong: (title: string) => Promise<void>
  updateSong: (id: string, title: string) => Promise<boolean>
  deleteSong: (id: string) => Promise<void>
  refreshSongs: () => Promise<void>
}

/**
 * 曲の管理を行うカスタムフック
 */
export const useSongs = (bandId: string | null): UseSongsReturn => {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  const loadSongsFromDB = useCallback(async () => {
    try {
      setLoading(true)

      if (!bandId) {
        setSongs([])
        setLoading(false)
        return
      }

      const dbSongs = await songService.fetchAll(bandId)
      setSongs(dbSongs || [])
      setLoading(false)
    } catch (error) {
      logger.error('曲の読み込みエラー:', error)
      setSongs([])
      setLoading(false)
    }
  }, [bandId])

  const addSong = useCallback(
    async (title: string) => {
      if (!bandId) {
        logger.error('バンドIDが見つかりません。先にバンド名を設定してください。')
        return
      }
      if (songs.some((song) => song.title === title)) {
        return
      }

      try {
        const created = await songService.create(title, bandId)
        setSongs((prev) => [...prev, created])
      } catch (error) {
        logger.error('曲の保存エラー:', error)
      }
    },
    [songs, bandId]
  )

  const updateSong = useCallback(
    async (id: string, title: string): Promise<boolean> => {
      if (!bandId) {
        logger.error('バンドIDが見つかりません')
        return false
      }

      const trimmed = title.trim()
      if (!trimmed) return false

      if (songs.some((song) => song.id !== id && song.title === trimmed)) {
        return false
      }

      const previous = songs.find((song) => song.id === id)
      setSongs((prev) =>
        prev.map((song) => (song.id === id ? { ...song, title: trimmed } : song))
      )

      try {
        await songService.update(id, bandId, trimmed)
        return true
      } catch (error) {
        logger.error('曲の更新エラー:', error)
        if (previous) {
          setSongs((prev) =>
            prev.map((song) => (song.id === id ? previous : song))
          )
        }
        return false
      }
    },
    [bandId, songs]
  )

  const deleteSong = useCallback(
    async (id: string) => {
      if (!bandId) {
        logger.error('バンドIDが見つかりません')
        return
      }

      const previous = songs
      setSongs((prev) => prev.filter((song) => song.id !== id))

      try {
        await songService.delete(id, bandId)
      } catch (error) {
        logger.error('曲の削除エラー:', error)
        setSongs(previous)
      }
    },
    [bandId, songs]
  )

  useEffect(() => {
    void loadSongsFromDB()
  }, [loadSongsFromDB])

  return {
    songs,
    loading,
    addSong,
    updateSong,
    deleteSong,
    refreshSongs: loadSongsFromDB,
  }
}
