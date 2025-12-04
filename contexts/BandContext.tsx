'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'

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

        const bandNameResult = await bandService.getBandName(session.user.id)

        if (bandNameResult) {
          setBandName(bandNameResult)
          localStorage.setItem('bandName', bandNameResult)
        } else {
          const savedBandName = localStorage.getItem('bandName') || 'No Band Name'
          setBandName(savedBandName)
        }
      } catch (error) {
        logger.error('エラーが発生しました:', error)
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