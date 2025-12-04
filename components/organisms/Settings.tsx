'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'
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
  const { setBandName: setGlobalBandName } = useBand()
  const { message: toastMessage, isVisible: isToastVisible, showToast, hideToast } = useToast()

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const band = await bandService.getBandByUserId(user.id)

        if (band) {
          setBandName(band.name || '')
          setLogoUrl(band.logo_url || '')
          setLogoIsLight(false) // 一時的にfalseに設定
        } else {
          // バンドデータが存在しない場合は空文字を設定
          setBandName('')
          setLogoUrl('')
          setLogoIsLight(false)
        }
      } catch (error) {
        logger.error('エラーが発生しました:', error)
        // エラー時も初期化
        setBandName('')
        setLogoUrl('')
        setLogoIsLight(false)
      }
    }
    fetchBand()
  }, [router])

  const handleUpdateBandNameWithLogo = async (logoUrlToSave: string) => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        showToast('ログインが必要です')
        router.push('/login')
        return
      }

      const existingBandId = await bandService.getBandId(user.id)

      if (existingBandId) {
        logger.log('バンド更新:', { name: bandName, logo_url: logoUrlToSave })
        try {
          await bandService.update(existingBandId, {
            name: bandName,
            logo_url: logoUrlToSave,
          })
          showToast('設定を更新しました')
          setGlobalBandName(bandName || 'No Band Name')
        } catch (error) {
          logger.error('バンド名の更新に失敗しました:', error)
          showToast('バンド名の更新に失敗しました')
        }
      } else {
        try {
          await bandService.create(user.id, bandName, logoUrlToSave)
          showToast('バンド名を保存しました')
        } catch (error) {
          logger.error('バンド名の保存に失敗しました:', error)
          showToast('バンド名の保存に失敗しました')
        }
      }
    } catch (error) {
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
                logger.log('ロゴアップロード/削除:', url)
                setLogoUrl(url)
                // ロゴがアップロードまたは削除されたら即座に保存
                setTimeout(() => {
                  // 最新のURLを直接渡して保存
                  handleUpdateBandNameWithLogo(url)
                }, 100)
              }}
              currentLogo={logoUrl}
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