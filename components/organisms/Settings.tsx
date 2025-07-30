'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/pages/api/supabaseClient'
import { useRouter } from 'next/router'

export default function Settings() {
  const [bandName, setBandName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
          .select('name')
          .eq('user_id', user.id)
          .single()
        
        if (error) {
          console.error('バンド情報の取得に失敗しました:', error)
          return
        }

        if (band) {
          setBandName(band.name || '')
        }
      } catch (error) {
        console.error('エラーが発生しました:', error)
      }
    }
    fetchBand()
  }, [router])

  const handleUpdateBandName = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        alert('ログインが必要です')
        router.push('/login')
        return
      }

      const { data: existingBand, error: fetchError } = await supabase
        .from('bands')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('バンド情報の取得に失敗しました:', fetchError)
        alert('バンド情報の取得に失敗しました')
        return
      }

      if (existingBand) {
        const { error: updateError } = await supabase
          .from('bands')
          .update({ name: bandName })
          .eq('id', existingBand.id)

        if (updateError) {
          console.error('バンド名の更新に失敗しました:', updateError)
          alert('バンド名の更新に失敗しました')
        } else {
          alert('バンド名を更新しました')
        }
      } else {
        const { error: insertError } = await supabase
          .from('bands')
          .insert([
            {
              user_id: user.id,
              name: bandName
            }
          ])

        if (insertError) {
          console.error('バンド名の保存に失敗しました:', insertError)
          alert('バンド名の保存に失敗しました')
        } else {
          alert('バンド名を保存しました')
        }
      }
    } catch (error) {
      console.error('エラーが発生しました:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="settings">
      <div className="settingsForm">
        <h2>バンド設定</h2>
        <div className="inputGroup">
          <label htmlFor="bandName">バンド名</label>
          <input
            id="bandName"
            type="text"
            value={bandName}
            onChange={(e) => setBandName(e.target.value)}
            className="input"
            placeholder="バンド名を入力"
          />
        </div>
        <button
          onClick={handleUpdateBandName}
          disabled={loading}
          className="submitButton"
        >
          {loading ? '更新中...' : '更新'}
        </button>
      </div>
    </div>
  )
} 