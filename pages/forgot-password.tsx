import Head from 'next/head'
import ForgotPasswordForm from '@/components/organisms/ForgotPasswordForm'

export default function ForgotPasswordPage() {
  return (
    <main>
      <Head>
        <title>パスワード再設定 | Setlist Maker</title>
        <meta name="description" content="Setlist Makerのパスワード再設定画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  )
}
