'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/pages/api/supabaseClient'

interface BandContextType {
  bandName: string
  setBandName: (name: string) => void
  loading: boolean
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
  const [bandName, setBandName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  // ローカルストレージからバンド名を取得
  useEffect(() => {
    const savedBandName = localStorage.getItem('bandName')
    if (savedBandName) {
      setBandName(savedBandName)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const fetchBandName = async () => {
      try {
        if (!session?.user?.id) {
          setLoading(false)
          return
        }

        const { data: band, error } = await supabase
          .from('bands')
          .select('name')
          .eq('user_id', session.user.id)
          .maybeSingle()

        if (error) {
          console.error('バンド情報の取得に失敗しました:', error)
          const savedBandName = localStorage.getItem('bandName') || 'No Band Name'
          setBandName(savedBandName)
        } else if (band && band.name) {
          setBandName(band.name)
          localStorage.setItem('bandName', band.name)
        } else {
          const savedBandName = localStorage.getItem('bandName') || 'No Band Name'
          setBandName(savedBandName)
        }
      } catch (error) {
        console.error('エラーが発生しました:', error)
        const savedBandName = localStorage.getItem('bandName') || 'No Band Name'
        setBandName(savedBandName)
      } finally {
        setLoading(false)
      }
    }

    fetchBandName()
  }, [session])

  const updateBandName = (name: string) => {
    setBandName(name)
    localStorage.setItem('bandName', name)
  }

  return (
    <BandContext.Provider value={{ bandName, setBandName: updateBandName, loading }}>{children}</BandContext.Provider>
  )
} 