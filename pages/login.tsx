import Auth from '@/components/organisms/Auth'
import Head from 'next/head'
import { LoginWithWelcome } from '@/components/organisms/LoginWithWelcome'

export default function LoginPage() {
  return (
    <main>
      <Head>
        <title>login | Setlist Maker</title>
        <meta name="description" content="Setlist Makerのログイン画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <LoginWithWelcome />
        </div>
      </section>
    </main>
  )
}
