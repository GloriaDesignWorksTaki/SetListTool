'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import Head from 'next/head'
import { useBand } from '@/contexts/BandContext'
import { LogoUpload } from '@/components/atoms/LogoUpload'
import { Button } from '@/components/atoms/Button'
import { Toast } from '@/components/atoms/Toast'
import { useToast } from '@/hooks/useToast'
import { bandService } from '@/services/bandService'
import { logger } from '@/utils/logger'
import { FiSave } from 'react-icons/fi'

export default function Settings() {
  const [bandName, setBandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(false)
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

    // Context に載った1回 fetch の結果をフォームに反映（追加の bands 問い合わせなし）
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
              disabled={loading}
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
            />
          </div>
        </div>
      </section>
    </main>
    </>
  )
}
