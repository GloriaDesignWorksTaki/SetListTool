import Document, { Html, Head, Main, NextScript } from 'next/document';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';

// propsの型
type Props = {}

class AppDocument extends Document<Props> {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="Cache-Control" content="no-cache" />
          <meta name="robots" content="noindex" />
          <meta name="googlebot" content="noindex" />
        </Head>
        <body>
          <Header />
          <Main />
          <Footer />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default AppDocument;
