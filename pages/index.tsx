import React from "react";
import { NextPage } from "next";
import Head from "next/head";
import SetlistTool from "@/components/SetlistTool";

const Home: NextPage = () => {
  return (
    <main>
      <Head>
        <title>Setlist Maker | セットリスト作成ツール</title>
        <meta name="description" content="バンドのセットリストを簡単に作成し、PDFで書き出すツールです。" />
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