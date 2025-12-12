import SignupForm from '@/components/organisms/SignupForm'
import Head from 'next/head'

export default function SignupPage() {
  return (
    <main>
      <Head>
        <title>サインアップ | Setlist Maker</title>
        <meta name="description" content="Setlist Makerのサインアップ画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <SignupForm />
        </div>
      </section>
    </main>
  )
}



