import Link from "next/link"

const Header: React.FC = (() => {
  return (
    <header>
      <h1>Setlist Maker</h1>
      <nav>
        <ul>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/settings">Settings</Link></li>
        </ul>
      </nav>
    </header>
  )
})

export default Header;