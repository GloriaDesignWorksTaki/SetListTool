import Auth from '@/components/organisms/Auth'
import Head from 'next/head'
export default function LoginPage() {
  return (
    <main>
      <Head>
        <title>Setlist Maker | ログイン</title>
        <meta name="description" content="Setlist Makerのログイン画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <Auth />
        </div>
      </section>
    </main>
  )
}