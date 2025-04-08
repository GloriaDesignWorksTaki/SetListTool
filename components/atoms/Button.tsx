"use client"

import React from "react";

interface ButtonProps {
  href: string;
  text: string;
}

const Button: React.FC<ButtonProps> = ({ href, text }) => {
  return (
    <div className="button">
      <a href={href}>{text}</a>
    </div>
  )
}

export default Button;