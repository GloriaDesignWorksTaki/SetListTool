import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Header />
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
      <Footer />
    </>
  )
}

export default App;