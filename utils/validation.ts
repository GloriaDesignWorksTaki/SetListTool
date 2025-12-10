/**
 * バリデーション用ユーティリティ関数
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'メールアドレスを入力してください' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '有効なメールアドレスを入力してください' }
  }

  return { isValid: true }
}

/**
 * パスワードのバリデーション
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'パスワードを入力してください' }
  }

  if (password.length < 6) {
    return { isValid: false, error: 'パスワードは6文字以上で入力してください' }
  }

  if (password.length > 128) {
    return { isValid: false, error: 'パスワードは128文字以内で入力してください' }
  }

  return { isValid: true }
}

/**
 * パスワード確認のバリデーション
 */
export const validatePasswordConfirmation = (
  password: string,
  confirmPassword: string
): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, error: 'パスワード再入力を行ってください' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'パスワードが一致しません' }
  }

  return { isValid: true }
}

/**
 * バンド名のバリデーション
 */
export const validateBandName = (bandName: string): ValidationResult => {
  if (!bandName || !bandName.trim()) {
    return { isValid: false, error: 'バンド名を入力してください' }
  }

  if (bandName.trim().length > 100) {
    return { isValid: false, error: 'バンド名は100文字以内で入力してください' }
  }

  return { isValid: true }
}

/**
 * バンドジャンルのバリデーション
 */
export const validateGenre = (genre: string): ValidationResult => {
  if (genre && genre.trim().length > 50) {
    return { isValid: false, error: 'バンドジャンルは50文字以内で入力してください' }
  }

  return { isValid: true }
}

/**
 * サインアップフォーム全体のバリデーション
 */
export interface SignupFormData {
  bandName: string
  genre: string
  email: string
  password: string
  confirmPassword: string
  privacyAgreed: boolean
}

export const validateSignupForm = (data: SignupFormData): ValidationResult => {
  // バンド名
  const bandNameResult = validateBandName(data.bandName)
  if (!bandNameResult.isValid) {
    return bandNameResult
  }

  // ジャンル
  const genreResult = validateGenre(data.genre)
  if (!genreResult.isValid) {
    return genreResult
  }

  // メールアドレス
  const emailResult = validateEmail(data.email)
  if (!emailResult.isValid) {
    return emailResult
  }

  // パスワード
  const passwordResult = validatePassword(data.password)
  if (!passwordResult.isValid) {
    return passwordResult
  }

  // パスワード確認
  const passwordConfirmationResult = validatePasswordConfirmation(
    data.password,
    data.confirmPassword
  )
  if (!passwordConfirmationResult.isValid) {
    return passwordConfirmationResult
  }

  // プライバシーポリシー同意
  if (!data.privacyAgreed) {
    return { isValid: false, error: 'プライバシーポリシーに同意してください' }
  }

  return { isValid: true }
}
