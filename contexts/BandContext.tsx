'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'
import { useSupabaseAuthReady } from '@/contexts/SupabaseAuthContext'

interface BandContextType {
  bandId: string | null
  bandName: string
  logoUrl: string
  loading: boolean
  error: Error | null
  setBandName: (name: string) => void
  setLogoUrl: (url: string) => void
  setBandId: (id: string | null) => void
  refetch: () => Promise<void>
  /** バンドが無ければ作成し、bandId を返す */
  ensureBand: (defaultBandName?: string) => Promise<string | null>
}

const BandContext = createContext<BandContextType | undefined>(undefined)

export const useBand = () => {
  const context = useContext(BandContext)
  if (context === undefined) {
    throw new Error('useBand must be used within a BandProvider')
  }
  return context
}

export const BandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bandId, setBandId] = useState<string | null>(null)
  const [bandName, setBandName] = useState<string>('')
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { data: session, status } = useSession()
  const { ready: supabaseReady } = useSupabaseAuthReady()
  const userId = session?.user?.id ?? null
  const storageKey = userId ? `bandName_${userId}` : null

  const applyBand = useCallback(
    (band: { id: string; name: string; logo_url?: string | null } | null) => {
      if (!band) {
        setBandId(null)
        setBandName(storageKey ? localStorage.getItem(storageKey) || '' : '')
        setLogoUrl('')
        return
      }

      setBandId(band.id)
      setBandName(band.name || '')
      setLogoUrl(band.logo_url && band.logo_url.trim() !== '' ? band.logo_url : '')
      if (storageKey && band.name) {
        localStorage.setItem(storageKey, band.name)
      }
    },
    [storageKey]
  )

  const refetch = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userId) {
        setBandId(null)
        setBandName('')
        setLogoUrl('')
        setLoading(false)
        return
      }

      const band = await bandService.getBandByUserId(userId)
      applyBand(band)
    } catch (err) {
      const nextError = err instanceof Error ? err : new Error('バンド情報の取得に失敗しました')
      logger.error('バンド情報取得エラー:', nextError)
      setError(nextError)
      if (storageKey) {
        setBandName(localStorage.getItem(storageKey) || '')
      }
    } finally {
      setLoading(false)
    }
  }, [userId, applyBand, storageKey])

  useEffect(() => {
    if (status === 'loading' || !supabaseReady) {
      // Supabase setSession 完了前は RLS 付きクエリを走らせない
      if (status === 'loading' || (status === 'authenticated' && !supabaseReady)) {
        setLoading(true)
      }
      return
    }
    void refetch()
  }, [status, supabaseReady, refetch])

  const updateBandName = useCallback(
    (name: string) => {
      setBandName(name)
      if (storageKey) {
        localStorage.setItem(storageKey, name)
      }
    },
    [storageKey]
  )

  const ensureBand = useCallback(
    async (defaultBandName = 'My Band') => {
      if (bandId) {
        return bandId
      }
      if (!userId) {
        return null
      }

      try {
        const existing = await bandService.getBandByUserId(userId)
        if (existing) {
          applyBand(existing)
          return existing.id
        }

        const created = await bandService.create(userId, defaultBandName)
        applyBand(created)
        return created.id
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error('バンド作成に失敗しました')
        logger.error('バンド確保エラー:', nextError)
        setError(nextError)
        return null
      }
    },
    [bandId, userId, applyBand]
  )

  const value = useMemo(
    () => ({
      bandId,
      bandName,
      logoUrl,
      loading,
      error,
      setBandName: updateBandName,
      setLogoUrl,
      setBandId,
      refetch,
      ensureBand,
    }),
    [bandId, bandName, logoUrl, loading, error, updateBandName, refetch, ensureBand]
  )

  return <BandContext.Provider value={value}>{children}</BandContext.Provider>
}
