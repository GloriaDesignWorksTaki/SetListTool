"use client";

import Link from "next/link";
import styles from '@/styles/Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <p>Copyright セットリスト作成ツール</p>
    </footer>
  )
}

export default Footer;