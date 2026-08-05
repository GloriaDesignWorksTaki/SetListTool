import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { SetlistItem } from '@/types'
import { logger } from '@/utils/logger'
import { setlistService } from '@/services/setlistService'

interface UseSetlistReturn {
  setlist: SetlistItem[]
  date: string
  venue: string
  eventTitle: string
  loading: boolean
  setDate: (value: string) => void
  setVenue: (value: string) => void
  setEventTitle: (value: string) => void
  addSongToSetlist: (song: string) => void
  addMCToSetlist: (mcContent: string) => void
  removeFromSetlist: (id: string) => void
  handleDragEnd: (event: DragEndEvent) => void
  getRemovedItem: (id: string) => SetlistItem | undefined
  syncSongTitle: (oldTitle: string, newTitle: string) => void
}

const sessionKey = (userId: string) => `setlist_v2_${userId}`

type CachedSetlist = {
  items: SetlistItem[]
  date: string
  venue: string
  eventTitle: string
}

const emptyCache = (): CachedSetlist => ({
  items: [],
  date: '',
  venue: '',
  eventTitle: '',
})

/**
 * セットリスト管理（DB永続 + sessionStorage フォールバック）
 */
export const useSetlist = (bandId: string | null): UseSetlistReturn => {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null
  const [setlist, setSetlist] = useState<SetlistItem[]>([])
  const [date, setDateState] = useState('')
  const [venue, setVenueState] = useState('')
  const [eventTitle, setEventTitleState] = useState('')
  const [loading, setLoading] = useState(true)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stateRef = useRef({ setlist, date, venue, eventTitle })
  /** ユーザー編集中は in-flight load による上書きを防ぐ */
  const dirtyRef = useRef(false)
  /** debounce 中の最新 payload */
  const pendingRef = useRef<CachedSetlist | null>(null)
  /** load 世代（stale response 破棄） */
  const loadSeqRef = useRef(0)
  const bandIdRef = useRef(bandId)
  const userIdRef = useRef(userId)

  useEffect(() => {
    stateRef.current = { setlist, date, venue, eventTitle }
  }, [setlist, date, venue, eventTitle])

  useEffect(() => {
    bandIdRef.current = bandId
  }, [bandId])

  useEffect(() => {
    userIdRef.current = userId
  }, [userId])

  const saveToSession = useCallback(
    (payload: CachedSetlist) => {
      if (!userId || typeof window === 'undefined') return
      try {
        sessionStorage.setItem(sessionKey(userId), JSON.stringify(payload))
      } catch (error) {
        logger.error('セットリスト session 保存エラー:', error)
      }
    },
    [userId]
  )

  const writeDb = useCallback(
    async (payload: CachedSetlist, targetBandId: string, targetUserId: string) => {
      await setlistService.upsert(targetBandId, targetUserId, {
        items: payload.items,
        eventDate: payload.date,
        venue: payload.venue,
        eventTitle: payload.eventTitle,
      })
    },
    []
  )

  /** debounce タイマーを止め、保留中の DB 書き込みを即時実行 */
  const flushPending = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }

    const payload = pendingRef.current
    if (!payload) return

    const targetBandId = bandIdRef.current
    const targetUserId = userIdRef.current
    pendingRef.current = null

    if (!targetBandId || !targetUserId) return

    void writeDb(payload, targetBandId, targetUserId)
      .then(() => {
        // flush 後に新しい dirty が無ければクリア
        if (!pendingRef.current) {
          dirtyRef.current = false
        }
      })
      .catch((error) => {
        logger.error('セットリスト DB 保存エラー:', error)
        // 失敗時は再度保存できるように dirty / pending を戻す
        dirtyRef.current = true
        if (!pendingRef.current) {
          pendingRef.current = payload
        }
      })
  }, [writeDb])

  const persist = useCallback(
    (payload: CachedSetlist) => {
      dirtyRef.current = true
      pendingRef.current = payload
      saveToSession(payload)

      if (!bandId || !userId) return

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }

      // 連続操作時の書き込みをまとめる
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null
        const latest = pendingRef.current
        if (!latest || !bandId || !userId) return

        pendingRef.current = null
        void writeDb(latest, bandId, userId)
          .then(() => {
            if (!pendingRef.current) {
              dirtyRef.current = false
            }
          })
          .catch((error) => {
            logger.error('セットリスト DB 保存エラー:', error)
            dirtyRef.current = true
            if (!pendingRef.current) {
              pendingRef.current = latest
            }
          })
      }, 400)
    },
    [bandId, userId, saveToSession, writeDb]
  )

  const applyCache = useCallback((next: CachedSetlist) => {
    setSetlist(next.items)
    setDateState(next.date)
    setVenueState(next.venue)
    setEventTitleState(next.eventTitle)
  }, [])

  const load = useCallback(async () => {
    const seq = ++loadSeqRef.current
    setLoading(true)

    if (!userId) {
      dirtyRef.current = false
      pendingRef.current = null
      applyCache(emptyCache())
      setLoading(false)
      return
    }

    // まず session から復元（即応性）— dirty にはしない
    let cached: CachedSetlist | null = null
    try {
      const raw = sessionStorage.getItem(sessionKey(userId))
      if (raw) {
        cached = JSON.parse(raw) as CachedSetlist
        applyCache({
          items: Array.isArray(cached.items) ? cached.items : [],
          date: cached.date || '',
          venue: cached.venue || '',
          eventTitle: cached.eventTitle || '',
        })
      }
    } catch (error) {
      logger.error('セットリスト session 復元エラー:', error)
    }

    // DB があれば上書き（編集中・stale は除く）
    if (bandId) {
      try {
        const record = await setlistService.fetchByBandId(bandId)
        if (seq !== loadSeqRef.current) return

        if (dirtyRef.current) {
          // 取得中にユーザーが編集した → ローカル優先で DB へ flush
          flushPending()
        } else if (record) {
          const next: CachedSetlist = {
            items: record.items || [],
            date: record.event_date || '',
            venue: record.venue || '',
            eventTitle: record.event_title || '',
          }
          applyCache(next)
          saveToSession(next)
        } else if (!cached) {
          applyCache(emptyCache())
        } else {
          // DB 空 + session にデータ → 初回同期として書き込み
          const fromCache: CachedSetlist = {
            items: Array.isArray(cached.items) ? cached.items : [],
            date: cached.date || '',
            venue: cached.venue || '',
            eventTitle: cached.eventTitle || '',
          }
          if (
            fromCache.items.length > 0 ||
            fromCache.date ||
            fromCache.venue ||
            fromCache.eventTitle
          ) {
            dirtyRef.current = true
            pendingRef.current = fromCache
            flushPending()
          }
        }
      } catch (error) {
        if (seq === loadSeqRef.current) {
          logger.error('セットリスト DB 復元エラー:', error)
        }
      }
    }

    if (seq === loadSeqRef.current) {
      setLoading(false)
    }
  }, [bandId, userId, saveToSession, applyCache, flushPending])

  useEffect(() => {
    void load()
    return () => {
      // 進行中 load を無効化
      loadSeqRef.current += 1
      // 保留 save を必ず書く（band 切替・unmount で消えないように）
      flushPending()
    }
  }, [load, flushPending])

  // bandId が後から付いたとき、session だけにある編集を DB へ
  useEffect(() => {
    if (!bandId || !userId) return
    if (dirtyRef.current && pendingRef.current) {
      flushPending()
    }
  }, [bandId, userId, flushPending])

  const recalculateOrder = useCallback((items: SetlistItem[]): SetlistItem[] => {
    let songCount = 0
    return items.map((item) => {
      if (item.type === 'song') {
        songCount++
        return { ...item, order: songCount }
      }
      return item
    })
  }, [])

  const addSongToSetlist = useCallback(
    (songToAdd: string) => {
      setSetlist((prev) => {
        const newSetlist: SetlistItem[] = [
          ...prev,
          {
            id: `song_${crypto.randomUUID()}`,
            type: 'song' as const,
            content: songToAdd,
            order: prev.filter((item) => item.type === 'song').length + 1,
          },
        ]
        const ordered = recalculateOrder(newSetlist)
        persist({
          items: ordered,
          date: stateRef.current.date,
          venue: stateRef.current.venue,
          eventTitle: stateRef.current.eventTitle,
        })
        return ordered
      })
    },
    [recalculateOrder, persist]
  )

  const addMCToSetlist = useCallback(
    (mcContent: string) => {
      if (!mcContent.trim()) return
      setSetlist((prev) => {
        const newSetlist: SetlistItem[] = [
          ...prev,
          {
            id: `mc_${crypto.randomUUID()}`,
            type: 'mc' as const,
            content: mcContent.trim(),
            order: 0,
          },
        ]
        persist({
          items: newSetlist,
          date: stateRef.current.date,
          venue: stateRef.current.venue,
          eventTitle: stateRef.current.eventTitle,
        })
        return newSetlist
      })
    },
    [persist]
  )

  const removeFromSetlist = useCallback(
    (id: string) => {
      setSetlist((prev) => {
        const updated = recalculateOrder(prev.filter((item) => item.id !== id))
        persist({
          items: updated,
          date: stateRef.current.date,
          venue: stateRef.current.venue,
          eventTitle: stateRef.current.eventTitle,
        })
        return updated
      })
    },
    [recalculateOrder, persist]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setSetlist((prev) => {
          const oldIndex = prev.findIndex((item) => item.id === active.id)
          const newIndex = prev.findIndex((item) => item.id === over.id)
          const updated = recalculateOrder(arrayMove(prev, oldIndex, newIndex))
          persist({
            items: updated,
            date: stateRef.current.date,
            venue: stateRef.current.venue,
            eventTitle: stateRef.current.eventTitle,
          })
          return updated
        })
      }
    },
    [recalculateOrder, persist]
  )

  const getRemovedItem = useCallback(
    (id: string) => setlist.find((item) => item.id === id),
    [setlist]
  )

  const syncSongTitle = useCallback(
    (oldTitle: string, newTitle: string) => {
      setSetlist((prev) => {
        const updated = prev.map((item) =>
          item.type === 'song' && item.content === oldTitle
            ? { ...item, content: newTitle }
            : item
        )
        persist({
          items: updated,
          date: stateRef.current.date,
          venue: stateRef.current.venue,
          eventTitle: stateRef.current.eventTitle,
        })
        return updated
      })
    },
    [persist]
  )

  const setDate = useCallback(
    (value: string) => {
      setDateState(value)
      persist({
        items: stateRef.current.setlist,
        date: value,
        venue: stateRef.current.venue,
        eventTitle: stateRef.current.eventTitle,
      })
    },
    [persist]
  )

  const setVenue = useCallback(
    (value: string) => {
      setVenueState(value)
      persist({
        items: stateRef.current.setlist,
        date: stateRef.current.date,
        venue: value,
        eventTitle: stateRef.current.eventTitle,
      })
    },
    [persist]
  )

  const setEventTitle = useCallback(
    (value: string) => {
      setEventTitleState(value)
      persist({
        items: stateRef.current.setlist,
        date: stateRef.current.date,
        venue: stateRef.current.venue,
        eventTitle: value,
      })
    },
    [persist]
  )

  return {
    setlist,
    date,
    venue,
    eventTitle,
    loading,
    setDate,
    setVenue,
    setEventTitle,
    addSongToSetlist,
    addMCToSetlist,
    removeFromSetlist,
    handleDragEnd,
    getRemovedItem,
    syncSongTitle,
  }
}
