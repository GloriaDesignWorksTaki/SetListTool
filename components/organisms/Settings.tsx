'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import Head from 'next/head'
import { useBand } from '@/contexts/BandContext'
import { LogoUpload } from '@/components/atoms/LogoUpload'
import { Button } from '@/components/atoms/Button'
import { Toast } from '@/components/atoms/Toast'
import { useToast } from '@/hooks/useToast'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'
import { FiSave, FiTrash2 } from 'react-icons/fi'

export default function Settings() {
  const [bandName, setBandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()
  const {
    bandId,
    bandName: contextBandName,
    logoUrl: contextLogoUrl,
    loading: bandLoading,
    setBandName: setGlobalBandName,
    setLogoUrl: setGlobalLogoUrl,
    setBandId,
    refetch,
  } = useBand()
  const { message: toastMessage, isVisible: isToastVisible, showToast, hideToast } = useToast()

  useEffect(() => {
    if (status === 'loading' || bandLoading) {
      return
    }

    if (!session?.user?.id) {
      router.push('/login')
      return
    }

    setBandName(contextBandName || '')
    setLogoUrl(contextLogoUrl || '')
  }, [session, status, router, bandLoading, contextBandName, contextLogoUrl])

  const handleUpdateBandNameWithLogo = async (logoUrlToSave: string) => {
    try {
      setLoading(true)

      if (!session?.user?.id) {
        showToast('ログインが必要です')
        router.push('/login')
        return
      }

      const logoUrlForSave = logoUrlToSave && logoUrlToSave.trim() !== '' ? logoUrlToSave : null
      let currentBandId = bandId

      if (currentBandId) {
        await bandService.update(currentBandId, {
          name: bandName,
          logo_url: logoUrlForSave || undefined,
        })
      } else {
        const created = await bandService.create(
          session.user.id,
          bandName,
          logoUrlForSave || undefined
        )
        currentBandId = created.id
        setBandId(created.id)
      }

      const nextLogo = logoUrlForSave || ''
      setLogoUrl(nextLogo)
      setGlobalLogoUrl(nextLogo)
      setGlobalBandName(bandName || 'No Band Name')
      showToast(currentBandId && bandId ? '設定を更新しました' : 'バンド名を保存しました')
      await refetch()
    } catch (error) {
      logger.error('設定の保存に失敗しました:', error)
      showToast('設定の保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBandName = async () => {
    await handleUpdateBandNameWithLogo(logoUrl)
  }

  const clearLocalCaches = () => {
    if (typeof window === 'undefined') return
    try {
      const keys: string[] = []
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key) keys.push(key)
      }
      keys.forEach((key) => {
        if (key.startsWith('setlist_') || key.startsWith('setlist_v2_') || key.startsWith('bandName_')) {
          sessionStorage.removeItem(key)
        }
      })
      const localKeys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key) localKeys.push(key)
      }
      localKeys.forEach((key) => {
        if (key.startsWith('bandName_')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // ignore
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      showToast('Type DELETE to confirm')
      return
    }

    const ok = window.confirm(
      'Are you sure you want to delete your account? Your band, songs, and setlists cannot be restored.'
    )
    if (!ok) return

    setDeleting(true)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      clearLocalCaches()
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      logger.error('Account deletion error:', error)
      showToast(error instanceof Error ? error.message : 'Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
    <main>
      <Head>
        <title>Settings | Setlist Maker</title>
        <meta name="description" content="Setlist Maker is a tool to create setlists and export them as PDFs." />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={hideToast}
      />
      <section>
        <div className="wrapper">
          <div className="block">
            <h2>Band Name</h2>
            <input
              id="bandName"
              type="text"
              value={bandName}
              onChange={(e) => setBandName(e.target.value)}
              className="input"
              placeholder="Enter Band Name"
              disabled={loading || deleting}
            />
          </div>
          <div className="block">
            <LogoUpload
              onLogoUpload={(url) => {
                setLogoUrl(url)
                void handleUpdateBandNameWithLogo(url)
              }}
              currentLogo={logoUrl && logoUrl.trim() !== '' ? logoUrl : undefined}
            />
          </div>
          <div className="block">
            <Button
              className="submitButton"
              onClick={handleUpdateBandName}
              text={loading ? 'Saving...' : 'Update'}
              icon={<FiSave />}
              disabled={loading || deleting}
            />
          </div>

          <div className="block dangerZone">
            <h2>Delete Account</h2>
            <p className="desc">
              Deleting your account will also remove your band, songs, and setlists. This cannot be undone.
            </p>
            <input
              type="text"
              className="input"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder='Type DELETE to confirm'
              disabled={deleting}
            />
            <Button
              className="submitButton secondary"
              onClick={() => void handleDeleteAccount()}
              text={deleting ? 'Deleting...' : 'Delete Account'}
              icon={<FiTrash2 />}
              disabled={deleting || deleteConfirm !== 'DELETE'}
            />
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
