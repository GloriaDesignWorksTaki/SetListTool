import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useRouter } from "next/router";
import { BandProvider } from "@/contexts/BandContext";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isAuthPage =
    router.pathname === '/login' ||
    router.pathname === '/signup' ||
    router.pathname === '/forgot-password' ||
    router.pathname === '/reset-password';

  return (
    <SessionProvider
      session={pageProps.session}
      // Supabase access token の典型的な寿命（1h）より少し短く。jwt コールバックで refresh
      refetchInterval={45 * 60}
      refetchOnWindowFocus={false}
    >
      <SupabaseAuthProvider>
        <BandProvider>
          {!isAuthPage && <Header />}
          <Component {...pageProps} />
          {!isAuthPage && <Footer />}
        </BandProvider>
      </SupabaseAuthProvider>
    </SessionProvider>
  )
}

export default App;
