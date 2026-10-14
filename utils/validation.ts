/**
 * バリデーション用ユーティリティ関数
 * 文言は i18n の MessageKey を返し、表示側で翻訳する
 */

import type { MessageKey } from '@/i18n/messages'

export interface ValidationResult {
  isValid: boolean
  errorKey?: MessageKey
}

/**
 * メールアドレスのバリデーション
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, errorKey: 'validation.emailRequired' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, errorKey: 'validation.emailInvalid' }
  }

  return { isValid: true }
}

/**
 * パスワードのバリデーション
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, errorKey: 'validation.passwordRequired' }
  }

  if (password.length < 6) {
    return { isValid: false, errorKey: 'validation.passwordMin' }
  }

  if (password.length > 128) {
    return { isValid: false, errorKey: 'validation.passwordMax' }
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
    return { isValid: false, errorKey: 'validation.passwordConfirmRequired' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, errorKey: 'validation.passwordMismatch' }
  }

  return { isValid: true }
}

/**
 * バンド名のバリデーション
 */
export const validateBandName = (bandName: string): ValidationResult => {
  if (!bandName || !bandName.trim()) {
    return { isValid: false, errorKey: 'validation.bandNameRequired' }
  }

  if (bandName.trim().length > 100) {
    return { isValid: false, errorKey: 'validation.bandNameMax' }
  }

  return { isValid: true }
}

/**
 * バンドジャンルのバリデーション
 */
export const validateGenre = (genre: string): ValidationResult => {
  if (genre && genre.trim().length > 50) {
    return { isValid: false, errorKey: 'validation.genreMax' }
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
  const bandNameResult = validateBandName(data.bandName)
  if (!bandNameResult.isValid) {
    return bandNameResult
  }

  const genreResult = validateGenre(data.genre)
  if (!genreResult.isValid) {
    return genreResult
  }

  const emailResult = validateEmail(data.email)
  if (!emailResult.isValid) {
    return emailResult
  }

  const passwordResult = validatePassword(data.password)
  if (!passwordResult.isValid) {
    return passwordResult
  }

  const passwordConfirmationResult = validatePasswordConfirmation(
    data.password,
    data.confirmPassword
  )
  if (!passwordConfirmationResult.isValid) {
    return passwordConfirmationResult
  }

  if (!data.privacyAgreed) {
    return { isValid: false, errorKey: 'validation.privacyRequired' }
  }

  return { isValid: true }
}
