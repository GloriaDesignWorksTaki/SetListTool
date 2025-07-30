import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useRouter } from "next/router";
import { BandProvider } from "@/contexts/BandContext";

const App = ({ Component, pageProps }: AppProps) => {

  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <BandProvider>
      {!isLoginPage && <Header />}
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
      {!isLoginPage && <Footer />}
    </BandProvider>
  )
}

export default App;