import Head from 'next/head'
import ResetPasswordForm from '@/components/organisms/ResetPasswordForm'

export default function ResetPasswordPage() {
  return (
    <main>
      <Head>
        <title>新しいパスワード | Setlist Maker</title>
        <meta name="description" content="Setlist Makerの新しいパスワード設定画面です。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <ResetPasswordForm />
        </div>
      </section>
    </main>
  )
}
