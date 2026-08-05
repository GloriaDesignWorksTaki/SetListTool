import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider, useSession, signOut } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useRouter } from "next/router";
import { BandProvider } from "@/contexts/BandContext";
import { useEffect, useRef } from "react";
import { setSupabaseAuth } from "@/utils/supabaseClient";

// Supabase認証を設定するコンポーネント
const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const lastTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    // トークン refresh 失敗時は再ログインを促す
    if (session?.error === 'RefreshAccessTokenError') {
      void signOut({ callbackUrl: '/login' });
      return;
    }

    const accessToken = session?.accessToken ?? null;
    // accessToken が変わったときだけ反映
    if (accessToken === lastTokenRef.current && (accessToken || status === 'unauthenticated')) {
      if (!accessToken && status === 'unauthenticated') {
        void setSupabaseAuth(null);
        lastTokenRef.current = null;
      }
      return;
    }

    lastTokenRef.current = accessToken;

    if (session && session.accessToken) {
      void setSupabaseAuth(session).catch((error) => {
        console.error('Supabase認証設定エラー:', error);
      });
    } else {
      void setSupabaseAuth(null).catch((error) => {
        console.error('Supabaseセッションクリアエラー:', error);
      });
    }
  }, [session, status]);

  return <>{children}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

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
