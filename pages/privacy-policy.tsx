import Head from 'next/head'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Head>
        <title>プライバシーポリシー | Setlist Maker</title>
        <meta name="description" content="Setlist Makerのプライバシーポリシーです。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
            <h1>プライバシーポリシー</h1>
            <p style={{ marginTop: '1rem', color: '#666' }}>
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>

            <div style={{ marginTop: '2rem' }}>
              <h2>1. はじめに</h2>
              <p>
                本プライバシーポリシーは、Setlist Maker（以下「当サービス」）における個人情報の取り扱いについて説明するものです。
                当サービスをご利用いただく際には、本ポリシーに同意していただく必要があります。
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>2. 収集する情報</h2>
              <p>当サービスでは、以下の情報を収集する場合があります：</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>バンド名</li>
                <li>バンドジャンル</li>
                <li>その他、サービス提供に必要な情報</li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>3. 情報の利用目的</h2>
              <p>収集した情報は、以下の目的で利用します：</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>サービスの提供・運営</li>
                <li>ユーザー認証</li>
                <li>お問い合わせへの対応</li>
                <li>サービス改善のための分析</li>
              </ul>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>4. 情報の管理</h2>
              <p>
                当サービスは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して適切なセキュリティ対策を講じます。
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>5. 第三者への提供</h2>
              <p>
                当サービスは、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
              </p>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h2>6. お問い合わせ</h2>
              <p>
                プライバシーポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
              </p>
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <Link href="/signup" style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}>
                サインアップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

