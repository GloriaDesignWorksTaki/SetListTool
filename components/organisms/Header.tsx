"use client"

import Link from "next/link"
import { useRouter } from 'next/router'
import { signOut } from 'next-auth/react'
import { useBand } from '@/contexts/BandContext'
import Image from 'next/image'

const Header: React.FC = () => {
  const router = useRouter()
  const { bandName, loading } = useBand()

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
            <li><Link href="/">Home</Link></li>
            <li><Link href="/settings">Settings</Link></li>
            <li>
              <Link href="/login" onClick={handleLogout}>Logout</Link>
            </li>
          </ul>
        </nav>
        {!loading && ( <div className="bandName">{bandName}</div> )}
      </div>
    </header>
  )
}

export default Header;