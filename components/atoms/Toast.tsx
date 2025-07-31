"use client"

import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false)
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => {
          onClose()
        }, 300)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className={`toast ${isExiting ? 'toast-exit' : ''}`}>{message}</div>
  )
} 