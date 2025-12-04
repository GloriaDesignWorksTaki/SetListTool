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
import { registerFonts } from "@/utils/fonts";

// PDF生成用のフォントを登録（クライアントサイドでのみ実行）
if (typeof window !== 'undefined') {
  registerFonts();
}

// Supabase認証を設定するコンポーネント
const SupabaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('SupabaseAuthProvider - Session status:', status);
    console.log('SupabaseAuthProvider - Session data:', session);
    
    if (session) {
      setSupabaseAuth(session);
    }
  }, [session, status]);

  return <>{children}</>;
};

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';

  return (
    <SessionProvider 
      session={pageProps.session}
      refetchInterval={5 * 60} // 5分ごとにセッションを更新
      refetchOnWindowFocus={true} // ウィンドウがフォーカスされたときにセッションを更新
    >
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