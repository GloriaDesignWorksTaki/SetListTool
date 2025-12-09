import { AppProps } from "next/app";
import "@/styles/reset.css"
import "@/styles/global.css"
import { SessionProvider, useSession } from "next-auth/react";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import { useRouter } from "next/router";
import { BandProvider } from "@/contexts/BandContext";
import { useEffect } from "react";
import { setSupabaseAuth } from "@/utils/supabaseClient";

// Supabase認証を設定するコンポーネント
const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    if (session && session.accessToken) {
      setSupabaseAuth(session).catch((error) => {
        console.error('Supabase認証設定エラー:', error);
      });
    } else {
      // セッションがない場合もSupabaseセッションをクリア
      setSupabaseAuth(null).catch((error) => {
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
      refetchInterval={5 * 60} // 5分ごとにセッションを更新
      refetchOnWindowFocus={true} // ウィンドウがフォーカスされたときにセッションを更新
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