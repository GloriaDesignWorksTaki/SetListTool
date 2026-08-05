'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { signOut, useSession } from 'next-auth/react'
import { setSupabaseAuth } from '@/utils/supabaseClient'

type SupabaseAuthContextValue = {
  /** NextAuth セッションが Supabase クライアントへ反映済みか */
  ready: boolean
}

const SupabaseAuthContext = createContext<SupabaseAuthContextValue>({
  ready: false,
})

export const useSupabaseAuthReady = () => useContext(SupabaseAuthContext)

/**
 * NextAuth セッションを Supabase クライアントに同期し、
 * 完了するまで ready=false とする。
 */
export const SupabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession()
  const [ready, setReady] = useState(false)
  const lastTokenRef = useRef<string | null | undefined>(undefined)
  const applySeqRef = useRef(0)

  useEffect(() => {
    if (status === 'loading') {
      setReady(false)
      return
    }

    if (session?.error === 'RefreshAccessTokenError') {
      setReady(false)
      lastTokenRef.current = undefined
      void signOut({ callbackUrl: '/login' })
      return
    }

    const accessToken = session?.accessToken ?? null

    // 同じトークンなら再適用しない（refetchInterval 等での ready フリッカー防止）
    if (lastTokenRef.current === accessToken && lastTokenRef.current !== undefined) {
      setReady(true)
      return
    }

    const seq = ++applySeqRef.current
    setReady(false)

    const apply = async () => {
      try {
        if (session?.accessToken) {
          await setSupabaseAuth(session)
        } else {
          await setSupabaseAuth(null)
        }

        if (seq !== applySeqRef.current) return
        lastTokenRef.current = accessToken
        setReady(true)
      } catch (error) {
        console.error('Supabase認証設定エラー:', error)
        if (seq === applySeqRef.current) {
          setReady(false)
        }
      }
    }

    void apply()
  }, [session, status])

  const value = useMemo(() => ({ ready }), [ready])

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}
