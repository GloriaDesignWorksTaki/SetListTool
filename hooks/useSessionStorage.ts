import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { logger } from '@/utils/logger'

/**
 * セッションストレージを管理するカスタムフック
 * 
 * @param key - ストレージのキー（ユーザーIDが自動的に付与される）
 * @param initialValue - 初期値
 * @returns 値、設定関数、削除関数
 */
export const useSessionStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] => {
  const { data: session } = useSession()
  
  // 初期値の参照を保持（配列やオブジェクトの場合の無限ループを防ぐ）
  const initialValueRef = useRef(initialValue)
  
  // ストレージキーを生成（ユーザーIDを含む）
  const storageKey = session?.user?.id ? `${key}_${session.user.id}` : null

  // 初期値をセッションストレージから読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    
    if (!storageKey) {
      return initialValue
    }

    try {
      const item = sessionStorage.getItem(storageKey)
      if (item) {
        return JSON.parse(item)
      }
    } catch (error) {
      logger.error(`セッションストレージ初期読み込みエラー (${storageKey}):`, error)
    }
    
    return initialValue
  })

  // セッションストレージに値を保存
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // 関数の場合は現在の値を使って計算
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)

        if (storageKey && typeof window !== 'undefined') {
          sessionStorage.setItem(storageKey, JSON.stringify(valueToStore))
        }
      } catch (error) {
        logger.error(`セッションストレージ保存エラー (${storageKey}):`, error)
      }
    },
    [storageKey, storedValue]
  )

  // セッションストレージから値を削除
  const removeValue = useCallback(() => {
    try {
      if (storageKey && typeof window !== 'undefined') {
        sessionStorage.removeItem(storageKey)
      }
      setStoredValue(initialValueRef.current)
    } catch (error) {
      logger.error(`セッションストレージ削除エラー (${storageKey}):`, error)
    }
  }, [storageKey])

  // セッションIDが変わったときにストレージから再読み込み
  useEffect(() => {
    if (typeof window === 'undefined' || !storageKey) {
      return
    }

    try {
      const item = sessionStorage.getItem(storageKey)
      if (item) {
        const parsed = JSON.parse(item)
        setStoredValue(parsed)
      } else {
        setStoredValue(initialValueRef.current)
      }
    } catch (error) {
      logger.error(`セッションストレージ読み込みエラー (${storageKey}):`, error)
      setStoredValue(initialValueRef.current)
    }
  }, [storageKey]) // storageKeyのみに依存

  return [storedValue, setValue, removeValue]
}

