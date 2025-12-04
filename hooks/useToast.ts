import { useState, useCallback } from 'react'

interface UseToastReturn {
  message: string
  isVisible: boolean
  showToast: (message: string) => void
  hideToast: () => void
}

/**
 * トースト通知の管理を行うカスタムフック
 * 
 * @returns トーストメッセージ、表示状態、表示・非表示関数
 */
export const useToast = (): UseToastReturn => {
  const [message, setMessage] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const showToast = useCallback((toastMessage: string) => {
    setMessage(toastMessage)
    setIsVisible(true)
  }, [])

  const hideToast = useCallback(() => {
    setIsVisible(false)
    // アニメーション後にメッセージをクリア
    setTimeout(() => {
      setMessage('')
    }, 300)
  }, [])

  return {
    message,
    isVisible,
    showToast,
    hideToast,
  }
}

