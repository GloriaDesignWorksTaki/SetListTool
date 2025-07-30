import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider, useSession } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useRouter } from "next/router";
import { BandProvider } from "@/contexts/BandContext";
import { useEffect } from "react";
import { setSupabaseAuth } from "./api/supabaseClient";

// Supabase認証を設定するコンポーネント
const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (session) {
      setSupabaseAuth(session);
    }
  }, [session]);

  return <>{children}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <SessionProvider session={pageProps.session}>
      <SupabaseAuthProvider>
        <BandProvider>
          {!isLoginPage && <Header />}
          <Component {...pageProps} />
          {!isLoginPage && <Footer />}
        </BandProvider>
      </SupabaseAuthProvider>
    </SessionProvider>
  )
}

export default App;