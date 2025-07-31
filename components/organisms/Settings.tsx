'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useBand } from '@/contexts/BandContext'
import { LogoUpload } from '@/components/atoms/LogoUpload'

export default function Settings() {
  const [bandName, setBandName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [logoIsLight, setLogoIsLight] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setBandName: setGlobalBandName } = useBand()

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: band, error } = await supabase
          .from('bands')
          .select('name, logo_url')
          .eq('user_id', user.id)
          .maybeSingle()
        
        if (error) {
          console.error('バンド情報の取得に失敗しました:', error)
          // テーブルが存在しない場合は無視
          if (error.code === '42703' || error.code === '42P01') {
            console.log('bandsテーブルまたはnameカラムが存在しません')
            return
          }
          return
        }

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
        console.error('エラーが発生しました:', error)
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
        alert('Login is required')
        router.push('/login')
        return
      }

      const { data: existingBand, error: fetchError } = await supabase
        .from('bands')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Failed to fetch band information:', fetchError)
        alert('Failed to fetch band information')
        return
      }

      if (existingBand) {
        console.log('バンド更新:', { name: bandName, logo_url: logoUrlToSave })
        const { error: updateError } = await supabase
          .from('bands')
          .update({ 
            name: bandName,
            logo_url: logoUrlToSave
          })
          .eq('id', existingBand.id)

        if (updateError) {
          console.error('Failed to update band name:', updateError)
          alert('Failed to update band name')
        } else {
          alert('Settings updated')
          setGlobalBandName(bandName || 'No Band Name')
        }
      } else {
        const { error: insertError } = await supabase
          .from('bands')
          .insert([
            {
              user_id: user.id,
              name: bandName,
              logo_url: logoUrlToSave
            }
          ])

        if (insertError) {
          console.error('Failed to save band name:', insertError)
          alert('Failed to save band name')
        } else {
          alert('Band name saved')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error')
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
                console.log('ロゴアップロード/削除:', url)
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
            <button
              onClick={handleUpdateBandName}
              disabled={loading}
              className="submitButton"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </div>
      </section>
    </main>
    </>
  )
} 