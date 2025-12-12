import Head from 'next/head'
import Link from 'next/link'

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Head>
        <title>プライバシーポリシー | Setlist Maker</title>
        <meta
          name="description"
          content="Setlist Makerのプライバシーポリシーです。"
        />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <div className="privacy-policy-container">
            <h1>プライバシーポリシー</h1>
            <p className="privacy-policy-update-date">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>
            <div className="privacy-policy-section">
              <h2>1. はじめに</h2>
              <p>
                本プライバシーポリシーは、Setlist Maker（以下「当サービス」）における個人情報の取り扱いについて説明するものです。
                当サービスをご利用いただく際には、本ポリシーに同意していただく必要があります。
              </p>
            </div>
            <div className="privacy-policy-section">
              <h2>2. 収集する情報</h2>
              <p>当サービスでは、以下の情報を収集する場合があります：</p>
              <ul>
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>バンド名</li>
                <li>バンドジャンル</li>
                <li>その他、サービス提供に必要な情報</li>
              </ul>
            </div>
            <div className="privacy-policy-section">
              <h2>3. 情報の利用目的</h2>
              <p>収集した情報は、以下の目的で利用します：</p>
              <ul>
                <li>サービスの提供・運営</li>
                <li>ユーザー認証</li>
                <li>お問い合わせへの対応</li>
                <li>サービス改善のための分析</li>
              </ul>
            </div>
            <div className="privacy-policy-section">
              <h2>4. 情報の管理</h2>
              <p>
                当サービスは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して適切なセキュリティ対策を講じます。
              </p>
            </div>

            <div className="privacy-policy-section">
              <h2>5. 第三者への提供</h2>
              <p>
                当サービスは、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
              </p>
            </div>

            <div className="privacy-policy-section">
              <h2>6. 使用する外部サービス</h2>
              <p>
                当サービスでは、以下の外部サービスを利用し、必要な範囲でデータが提供される場合があります。
              </p>
              <ul>
                <li>Supabase（認証・データベース管理）</li>
                <li>Vercel（ホスティングサービス）</li>
              </ul>
              <p>
                これらのサービスは、それぞれのプライバシーポリシーに基づいてデータを処理します。
              </p>
            </div>

            <div className="privacy-policy-section">
              <h2>7. クッキー・ローカルストレージの利用</h2>
              <p>
                当サービスでは、認証状態の保持や利便性向上のため、ブラウザのクッキーおよびローカルストレージを利用する場合があります。
              </p>
            </div>

            <div className="privacy-policy-section">
              <h2>8. ユーザーの権利</h2>
              <p>
                ユーザーは、自身の情報の開示、訂正、削除を求めることができます。ご希望の場合は、お問い合わせフォームよりご連絡ください。
              </p>
            </div>

            <div className="privacy-policy-section">
              <h2>9. プライバシーポリシーの変更</h2>
              <p>
                本ポリシーは必要に応じて変更される場合があります。重要な変更がある場合は、当サービス上で告知します。
              </p>
            </div>
            <div className="privacy-policy-back-link">
              <Link href="/signup">
                サインアップページに戻る
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}