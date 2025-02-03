"use client";

import Link from "next/link";
import styles from '@/styles/Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.headerTitle}>
        <h1>セットリスト作成ツール</h1>
      </Link>
    </header>
  )
}

export default Header;