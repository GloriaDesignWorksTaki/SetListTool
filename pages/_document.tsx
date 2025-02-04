import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <meta httpEquiv="Cache-Control" content="no-cache" />
        <meta name="robots" content="noindex" />
        <meta name="googlebot" content="noindex" />
        <title>セットリスト作成ツール</title>
        <meta name="description" content="セットリストが簡単に作れるツールです。PDF、png、jpegで書き出せます。" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}