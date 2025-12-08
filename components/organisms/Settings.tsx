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
  const [logoIsLight, setLogoIsLight] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const { setBandName: setGlobalBandName } = useBand()
  const { message: toastMessage, isVisible: isToastVisible, showToast, hideToast } = useToast()

  useEffect(() => {
    const fetchBand = async () => {
      if (status === 'loading') {
        return
      }
      
      if (!session?.user?.id) {
        router.push('/login')
        return
      }

      try {
        const band = await bandService.getBandByUserId(session.user.id)

        if (band) {
          setBandName(band.name || '')
          const logoUrlValue = band.logo_url && band.logo_url.trim() !== '' ? band.logo_url : ''
          setLogoUrl(logoUrlValue)
          setLogoIsLight(false)
        } else {
          setBandName('')
          setLogoUrl('')
          setLogoIsLight(false)
        }
      } catch (error: any) {
        logger.error('エラーが発生しました:', error)
        // エラー時も初期化
        setBandName('')
        setLogoUrl('')
        setLogoIsLight(false)
      }
    }
    fetchBand()
  }, [session, status, router])

  const handleUpdateBandNameWithLogo = async (logoUrlToSave: string) => {
    try {
      setLoading(true)

      if (!session?.user?.id) {
        showToast('ログインが必要です')
        router.push('/login')
        return
      }

      const existingBandId = await bandService.getBandId(session.user.id)

      const logoUrlForSave = logoUrlToSave && logoUrlToSave.trim() !== '' ? logoUrlToSave : null

      if (existingBandId) {
        try {
          await bandService.update(existingBandId, {
            name: bandName,
            logo_url: logoUrlForSave || undefined,
          })
          await new Promise(resolve => setTimeout(resolve, 200))

          const updatedBand = await bandService.getBandByUserId(session.user.id)
          if (updatedBand) {
            const updatedLogoUrl = updatedBand.logo_url && updatedBand.logo_url.trim() !== '' ? updatedBand.logo_url : ''
            setLogoUrl(updatedLogoUrl)
          }
          showToast('設定を更新しました')
          setGlobalBandName(bandName || 'No Band Name')
        } catch (error) {
          logger.error('バンド名の更新に失敗しました:', error)
          showToast('バンド名の更新に失敗しました')
        }
      } else {
        try {
          await bandService.create(session.user.id, bandName, logoUrlForSave || undefined)
          await new Promise(resolve => setTimeout(resolve, 200))
          const createdBand = await bandService.getBandByUserId(session.user.id)
          if (createdBand) {
            const createdLogoUrl = createdBand.logo_url && createdBand.logo_url.trim() !== '' ? createdBand.logo_url : ''
            setLogoUrl(createdLogoUrl)
          }
          showToast('バンド名を保存しました')
        } catch (error) {
          logger.error('バンド名の保存に失敗しました:', error)
          showToast('バンド名の保存に失敗しました')
        }
      }
    } catch (error: any) {
      logger.error('エラーが発生しました:', error)
      showToast('エラーが発生しました')
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
            />
          </div>
          <div className="block">
            <LogoUpload
              onLogoUpload={(url) => {
                setLogoUrl(url)
                setTimeout(() => {
                  handleUpdateBandNameWithLogo(url)
                }, 100)
              }}
              currentLogo={logoUrl && logoUrl.trim() !== '' ? logoUrl : undefined}
            />
          </div>
          <div className="block">
            <Button className="submitButton" onClick={handleUpdateBandName} text="Update" icon={<FiSave />} />
          </div>
        </div>
      </section>
    </main>
    </>
  )
}