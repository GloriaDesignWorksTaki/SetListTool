"use client";

import React from "react";
import Link from "next/link";
import styles from "@/styles/Button.module.css"

interface ButtonProps {
  href: string;
  text: string;
}

const Button:React.FC<ButtonProps> = ({ href, text }) => {
  return (
    <Link className={styles.Button} href={href}>{text}</Link>
  )
}

export default Button;