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
    if (status === "loading") {
      return;
    }
    if (!session) {
      router.push("/login");
    } else {
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