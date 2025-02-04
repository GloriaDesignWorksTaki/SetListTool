import type { AppProps } from "next/app";
import Head from "next/head";
import { ReactNode } from "react";
import Header from "@/components/organisms/Header";
import Main from "@/pages/index";
import Footer from "@/components/organisms/Footer";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <html lang="ja">
      <Head>
        <meta charSet="utf-8" />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <body>
        <Header />
        <Main />
        <Footer />
      </body>
    </html>
  );
}