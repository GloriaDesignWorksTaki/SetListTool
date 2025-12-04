import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { Song } from '@/types'

interface UseSongsReturn {
  songs: Song[]
  loading: boolean
  addSong: (title: string) => void
  deleteSong: (title: string) => void
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
        console.log('バンドIDが見つからないため、データベースからの読み込みをスキップ')
        setSongs([])
        setLoading(false)
        return
      }

      const { data: dbSongs, error } = await supabase
        .from("songs")
        .select('id, title, band_id')
        .eq('band_id', bandId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error("Supabase select error:", error.message)
        setSongs([])
        setLoading(false)
        return
      }

      if (dbSongs && dbSongs.length > 0) {
        setSongs(dbSongs)
      } else {
        setSongs([])
      }
      
      setLoading(false)
    } catch (error) {
      console.error("曲の読み込みエラー:", error)
      setSongs([])
      setLoading(false)
    }
  }, [bandId])

  // Supabaseへの登録処理
  const addSongToDB = useCallback(async (title: string) => {
    try {
      if (!bandId) {
        console.error('バンドIDが見つかりません。先にバンド名を設定してください。')
        return
      }

      const { data, error } = await supabase
        .from("songs")
        .insert([{ title, band_id: bandId }])
        .select('id, title')

      if (error) {
        console.error("Supabase insert error:", error.message)
      } else {
        console.log("曲をデータベースに保存しました:", title)
      }
    } catch (error) {
      console.error("曲の保存エラー:", error)
    }
  }, [bandId])

  // データベースから曲を削除
  const deleteSongFromDB = useCallback(async (title: string) => {
    try {
      if (!bandId) {
        console.error('バンドIDが見つかりません')
        return
      }

      const { error } = await supabase
        .from("songs")
        .delete()
        .eq('title', title)
        .eq('band_id', bandId)

      if (error) {
        console.error("Supabase delete error:", error.message)
      } else {
        console.log("曲をデータベースから削除しました:", title)
      }
    } catch (error) {
      console.error("曲の削除エラー:", error)
    }
  }, [bandId])

  // 曲を追加
  const addSong = useCallback((song: string) => {
    const newSong: Song = {
      id: `local_${performance.now()}`,
      title: song
    }
    
    setSongs((prev) => [...prev, newSong])
    addSongToDB(song) // Supabaseに保存
  }, [addSongToDB])

  // 曲を削除
  const deleteSong = useCallback((songToDelete: string) => {
    setSongs((prev) => prev.filter((song) => song.title !== songToDelete))
    deleteSongFromDB(songToDelete) // Supabaseから削除
  }, [deleteSongFromDB])

  // バンドIDが変更されたときに曲を再読み込み
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

