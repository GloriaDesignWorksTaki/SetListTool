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
  const storageKey = session?.user?.id ? `bandName_${session.user.id}` : null

  useEffect(() => {
    const fetchBandName = async () => {
      try {
        setLoading(true)

        if (!session?.user?.id) {
          setBandName('')
          setLoading(false)
          return
        }

        const bandNameResult = await bandService.getBandName(session.user.id)

        if (bandNameResult) {
          setBandName(bandNameResult)
          if (storageKey) {
            localStorage.setItem(storageKey, bandNameResult)
          }
        } else {
          const savedBandName = storageKey ? localStorage.getItem(storageKey) : null
          setBandName(savedBandName || '')
        }
      } catch (error) {
        logger.error('エラーが発生しました:', error)
        const savedBandName = storageKey ? localStorage.getItem(storageKey) : null
        setBandName(savedBandName || '')
      } finally {
        setLoading(false)
      }
    }

    fetchBandName()
  }, [session, storageKey])

  const updateBandName = (name: string) => {
    setBandName(name)
    if (storageKey) {
      localStorage.setItem(storageKey, name)
    }
  }

  return (
    <BandContext.Provider value={{ bandName, setBandName: updateBandName, loading }}>{children}</BandContext.Provider>
  )
}