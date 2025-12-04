import { useState, useCallback } from 'react'

interface UseToastReturn {
  message: string
  isVisible: boolean
  showToast: (message: string) => void
  hideToast: () => void
}

/**
 * トースト通知を管理するカスタムフック
 * @returns トーストメッセージ、表示状態、表示・非表示関数
 */
export const useToast = (): UseToastReturn => {
  const [message, setMessage] = useState<string>('')
  const [isVisible, setIsVisible] = useState<boolean>(false)

  const showToast = useCallback((msg: string) => {
    setMessage(msg)
    setIsVisible(true)
    
    // 3秒後に自動的に非表示
    setTimeout(() => {
      setIsVisible(false)
    }, 3000)
  }, [])

  const hideToast = useCallback(() => {
    setIsVisible(false)
  }, [])

  return {
    message,
    isVisible,
    showToast,
    hideToast,
  }
}

