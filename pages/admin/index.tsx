'use client'

import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import type {
  AdminBandRow,
  AdminOverviewResponse,
  AdminUserRow,
} from '@/pages/api/admin/overview'

type TabId = 'users' | 'bands'

const formatDate = (value: string | null) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('ja-JP')
  } catch {
    return value
  }
}

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<TabId>('users')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<AdminOverviewResponse['stats'] | null>(null)
  const [users, setUsers] = useState<AdminUserRow[]>([])
  const [bands, setBands] = useState<AdminBandRow[]>([])

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.replace('/login')
      return
    }

    if (!session.isAdmin) {
      router.replace('/')
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch('/api/admin/overview')
        const data = (await response.json()) as AdminOverviewResponse & { error?: string }
        if (!response.ok) {
          throw new Error(data.error || '管理者データの取得に失敗しました')
        }
        setStats(data.stats)
        setUsers(data.users || [])
        setBands(data.bands || [])
      } catch (err) {
        const message = err instanceof Error ? err.message : '管理者データの取得に失敗しました'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [session, status, router])

  if (status === 'loading' || (session?.isAdmin && loading && !stats && !error)) {
    return (
      <main>
        <section>
          <div className="wrapper">
            <p>読み込み中...</p>
          </div>
        </section>
      </main>
    )
  }

  if (!session?.isAdmin) {
    return null
  }

  return (
    <main>
      <Head>
        <title>Admin | Setlist Maker</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <section>
        <div className="wrapper adminPage">
          <h2 className="adminTitle">Admin</h2>
          <p className="desc">ユーザーとバンドの一覧（管理者専用）</p>

          {error && <div className="errorMessage">{error}</div>}

          {stats && (
            <div className="adminStats">
              <div className="adminStatItem">
                <span className="adminStatLabel">Users</span>
                <span className="adminStatValue">{stats.userCount}</span>
              </div>
              <div className="adminStatItem">
                <span className="adminStatLabel">Confirmed</span>
                <span className="adminStatValue">{stats.confirmedUserCount}</span>
              </div>
              <div className="adminStatItem">
                <span className="adminStatLabel">Bands</span>
                <span className="adminStatValue">{stats.bandCount}</span>
              </div>
            </div>
          )}

          <div className="adminTabs">
            <button
              type="button"
              className={`adminTab ${tab === 'users' ? 'active' : ''}`}
              onClick={() => setTab('users')}
            >
              Users
            </button>
            <button
              type="button"
              className={`adminTab ${tab === 'bands' ? 'active' : ''}`}
              onClick={() => setTab('bands')}
            >
              Bands
            </button>
          </div>

          {tab === 'users' && (
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Band</th>
                    <th>Confirmed</th>
                    <th>Created</th>
                    <th>Last sign in</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5}>ユーザーがいません</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email || '-'}</td>
                        <td>{user.bandName || '-'}</td>
                        <td>{user.emailConfirmed ? 'Yes' : 'No'}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>{formatDate(user.lastSignInAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'bands' && (
            <div className="adminTableWrap">
              <table className="adminTable">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Genre</th>
                    <th>User ID</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.length === 0 ? (
                    <tr>
                      <td colSpan={4}>バンドがありません</td>
                    </tr>
                  ) : (
                    bands.map((band) => (
                      <tr key={band.id}>
                        <td>{band.name}</td>
                        <td>{band.genre || '-'}</td>
                        <td className="adminMono">{band.userId}</td>
                        <td>{formatDate(band.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
