import Document, { Html, Head, Main, NextScript } from 'next/document';

// propsの型
type Props = {}

class AppDocument extends Document<Props> {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
          <meta httpEquiv="Cache-Control" content="no-cache" />
          <meta name="robots" content="noindex" />
          <meta name="googlebot" content="noindex" />
          {/* スマホでのタッチ操作最適化 */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AppDocument;
