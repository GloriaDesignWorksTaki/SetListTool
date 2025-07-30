import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "@/pages/api/supabaseClient";
import SetlistTool from "@/components/organisms/SetlistTool";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        router.push("/login");
      }
    };
    checkSession();
  }, []);

  if (loading) return <div>読み込み中...</div>;

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