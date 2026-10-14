"use client"

import Link from "next/link"
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { useBand } from '@/contexts/BandContext'
import Image from 'next/image'
import { LangSelect } from '@/components/atoms/LangSelect'
import { useLocale } from '@/contexts/LocaleContext'

const Header: React.FC = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const { bandName, loading } = useBand()
  const { t } = useLocale()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <header>
      <Image src="/img/logo-white.webp" alt="logo" width={30} height={30} />
      <h1>Setlist Maker</h1>
      <div className="headerContent">
        <nav>
          <ul>
            <li><Link href="/">{t('nav.home')}</Link></li>
            <li><Link href="/settings">{t('nav.settings')}</Link></li>
            {session?.isAdmin && (
              <li><Link href="/admin">{t('nav.admin')}</Link></li>
            )}
            <li>
              <Link href="/login" onClick={handleLogout}>{t('nav.logout')}</Link>
            </li>
          </ul>
        </nav>
        <LangSelect />
        {!loading && ( <div className="bandName">{bandName}</div> )}
      </div>
    </header>
  )
}

export default Header;
