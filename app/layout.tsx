import type { Metadata } from "next";
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "セットリスト作成ツール",
  description: "セットリストが簡単に作れるツールです。PDF、png、jpegで書き出せます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
