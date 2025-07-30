"use client"

import Link from "next/link"
import { supabase } from "@/pages/api/supabaseClient"
import { useRouter } from 'next/router'
import { useBand } from '@/contexts/BandContext'

const Header: React.FC = () => {
  const router = useRouter()
  const { bandName, loading } = useBand()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    } else {
      router.push('/login')
    }
  }

  return (
    <header>
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