import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { SetlistItem } from '@/types'
import { logger } from '@/utils/logger'

interface UseSetlistReturn {
  setlist: SetlistItem[]
  addSongToSetlist: (song: string) => void
  addMCToSetlist: (mcContent: string) => void
  removeFromSetlist: (id: string) => void
  handleDragEnd: (event: DragEndEvent) => void
  getRemovedItem: (id: string) => SetlistItem | undefined
}

/**
 * セットリストの管理を行うカスタムフック
 * セッションストレージへの保存・復元も含む
 * @returns セットリスト、操作関数
 */
export const useSetlist = (): UseSetlistReturn => {
  const { data: session } = useSession()
  const [setlist, setSetlist] = useState<SetlistItem[]>([])

  // Setlistをセッションに保存
  const saveSetlistToSession = useCallback((newSetlist: SetlistItem[]) => {
    if (session?.user?.id) {
      sessionStorage.setItem(`setlist_${session.user.id}`, JSON.stringify(newSetlist))
    }
  }, [session?.user?.id])

  // セッションからSetlistを復元
  const restoreSetlistFromSession = useCallback(() => {
    if (session?.user?.id) {
      const savedSetlist = sessionStorage.getItem(`setlist_${session.user.id}`)
      if (savedSetlist) {
        try {
          const parsedSetlist = JSON.parse(savedSetlist)
          setSetlist(parsedSetlist)
        } catch (error) {
          logger.error('Setlist復元エラー:', error)
        }
      }
    }
  }, [session?.user?.id])

  // 曲の順番を再計算する関数
  const recalculateOrder = useCallback((items: SetlistItem[]): SetlistItem[] => {
    let songCount = 0
    return items.map(item => {
      if (item.type === 'song') {
        songCount++
        return {
          ...item,
          order: songCount
        }
      }
      return item
    })
  }, [])

  // セットリストに曲を追加
  const addSongToSetlist = useCallback((songToAdd: string) => {
    setSetlist((prev) => {
      const newSetlist: SetlistItem[] = [...prev, {
        id: `song_${performance.now()}`,
        type: 'song' as const,
        content: songToAdd,
        order: prev.filter(item => item.type === 'song').length + 1
      }]
      const orderedSetlist = recalculateOrder(newSetlist)
      saveSetlistToSession(orderedSetlist)
      return orderedSetlist
    })
  }, [saveSetlistToSession, recalculateOrder])

  // セットリストにMCを追加
  const addMCToSetlist = useCallback((mcContent: string) => {
    if (!mcContent.trim()) return

    setSetlist((prev) => {
      const newSetlist: SetlistItem[] = [...prev, {
        id: `mc_${performance.now()}`,
        type: 'mc' as const,
        content: mcContent.trim(),
        order: 0
      }]
      saveSetlistToSession(newSetlist)
      return newSetlist
    })
  }, [saveSetlistToSession])

  // セットリストからアイテムを削除
  const removeFromSetlist = useCallback((id: string) => {
    setSetlist((prev) => {
      const newSetlist = prev.filter(item => item.id !== id)
      const updatedSetlist = recalculateOrder(newSetlist)
      saveSetlistToSession(updatedSetlist)
      return updatedSetlist
    })
  }, [saveSetlistToSession, recalculateOrder])

  // ドラッグ&ドロップの終了処理
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setSetlist((prev) => {
        const oldIndex = prev.findIndex(item => item.id === active.id)
        const newIndex = prev.findIndex(item => item.id === over.id)
        const newSetlist = arrayMove(prev, oldIndex, newIndex)
        const updatedSetlist = recalculateOrder(newSetlist)
        saveSetlistToSession(updatedSetlist)
        return updatedSetlist
      })
    }
  }, [saveSetlistToSession, recalculateOrder])

  // 削除されたアイテムを取得（トースト通知用）
  const getRemovedItem = useCallback((id: string) => {
    return setlist.find(item => item.id === id)
  }, [setlist])

  // セッションストレージから復元
  useEffect(() => {
    restoreSetlistFromSession()
  }, [restoreSetlistFromSession])

  return {
    setlist,
    addSongToSetlist,
    addMCToSetlist,
    removeFromSetlist,
    handleDragEnd,
    getRemovedItem,
  }
}

