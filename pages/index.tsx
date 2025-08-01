import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import SetlistTool from "@/components/organisms/SetlistTool";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('Home - Session status:', status);
    console.log('Home - Session data:', session);
    
    if (status === "loading") {
      return; // まだローディング中
    }

    if (!session) {
      console.log('Home - No session, redirecting to login');
      router.push("/login");
    } else {
      console.log('Home - Session found, setting loading to false');
      setLoading(false);
    }
  }, [session, status, router]);

  if (loading || status === "loading") return <div>読み込み中...</div>;

  return (
    <main>
      <Head>
        <title>Setlist Maker | セットリスト作成ツール</title>
        <meta name="description" content="バンドのセットリストを簡単に作成し、PDFで書き出すツールです。" />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <section>
        <div className="wrapper">
          <SetlistTool />
        </div>
      </section>
    </main>
  );
};

export default Home;