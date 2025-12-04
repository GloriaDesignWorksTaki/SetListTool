/**
 * ロガーユーティリティ
 * 開発環境でのみログを出力し、本番環境ではエラーのみ出力
 */

const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  /**
   * デバッグログ（開発環境のみ）
   */
  log: (...args: any[]): void => {
    if (isDevelopment) {
      console.log(...args)
    }
  },

  /**
   * 情報ログ（開発環境のみ）
   */
  info: (...args: any[]): void => {
    if (isDevelopment) {
      console.info(...args)
    }
  },

  /**
   * 警告ログ（開発環境のみ）
   */
  warn: (...args: any[]): void => {
    if (isDevelopment) {
      console.warn(...args)
    }
  },

  /**
   * エラーログ（常に出力）
   */
  error: (...args: any[]): void => {
    console.error(...args)
  },

  /**
   * デバッグログ（条件付き）
   * @param condition - ログを出力する条件
   * @param args - ログに出力する引数
   */
  debug: (condition: boolean, ...args: any[]): void => {
    if (condition && isDevelopment) {
      console.log(...args)
    }
  },
}

