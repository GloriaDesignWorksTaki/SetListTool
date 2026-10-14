import type { Locale } from './types'

const en = {
  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.ja': '日本語',

  'nav.home': 'Home',
  'nav.settings': 'Settings',
  'nav.admin': 'Admin',
  'nav.logout': 'Logout',

  'auth.beta': 'Setlist Maker β Version 0.99.000',
  'auth.loginTitle': 'Log in',
  'auth.signupTitle': 'Sign up',
  'auth.forgotTitle': 'Reset password',
  'auth.resetTitle': 'New password',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordConfirm': 'Confirm password',
  'auth.newPassword': 'New password',
  'auth.newPasswordConfirm': 'Confirm new password',
  'auth.bandName': 'Band name*',
  'auth.genre': 'Genre',
  'auth.login': 'Log in',
  'auth.signup': 'Sign up',
  'auth.processing': 'Processing...',
  'auth.sending': 'Sending...',
  'auth.updating': 'Updating...',
  'auth.resending': 'Resending...',
  'auth.forgotLink': 'Forgot password?',
  'auth.signupLink': 'Create an account',
  'auth.loginLink': 'Back to log in',
  'auth.sendResetEmail': 'Send reset email',
  'auth.updatePassword': 'Update password',
  'auth.goToLogin': 'Go to log in',
  'auth.resendReset': 'Resend reset email',
  'auth.resendConfirm': 'Resend confirmation email',
  'auth.privacyAgreePrefix': 'I agree to the ',
  'auth.privacyPolicy': 'Privacy Policy',
  'auth.privacyAgreeSuffix': '*',
  'auth.forgotDesc':
    'Enter your registered email address. We will send you a link to reset your password.',
  'auth.preparing': 'Preparing...',
  'auth.emailRequiredBoth': 'Please enter your email and password',
  'auth.resendNeedEmail': 'Enter the email address to resend to.',
  'auth.loginError': 'Login error: {message}',
  'auth.genericError': 'Something went wrong: {message}',
  'auth.unknownError': 'Unknown error',
  'auth.invalidCredentials': 'Incorrect email or password',
  'auth.emailNotConfirmed': 'Please confirm your email before logging in.',
  'auth.resendFailed': 'Failed to resend confirmation email: {message}',
  'auth.resendSuccess': 'Confirmation email sent. Please check your inbox.',
  'auth.emailExists': 'This email address is already in use',
  'auth.signupFailed': 'Sign up failed. Please try again later.',
  'auth.signupError': 'Sign up error: {message}',
  'auth.emailCheckFailed': 'Could not verify email uniqueness. Continuing with sign up.',
  'auth.emailCheckConfigMissing': 'Email check is not configured. Continuing with sign up.',
  'auth.resetSendFailed': 'Failed to send email: {message}',
  'auth.resetSent':
    'Reset email sent. Open the link in the email to set a new password.',
  'auth.resetLinkExpired': 'This reset link has expired. Please request a new email.',
  'auth.resetLinkInvalid': 'This reset link is invalid. Please request a new email.',
  'auth.resetSessionFailed': 'Could not start reset session. Please request a new email.',
  'auth.resetPrepareFailed': 'Something went wrong while preparing the reset.',
  'auth.resetUpdateFailed': 'Failed to update password: {message}',
  'auth.resetSuccess': 'Password updated. Please log in with your new password.',
  'auth.verifyExpired':
    'This confirmation link has expired. Please resend the confirmation email.',
  'auth.verifyFailed': 'Email verification failed. Please try again.',
  'auth.verifySuccess': 'Email verified. Please log in.',
  'auth.emailSentTitle': 'We sent a confirmation email to',
  'auth.emailSentResentTitle': 'Confirmation email resent',
  'auth.emailSentBody': 'Click the link in the email to activate your account.',
  'auth.emailResendFailed': 'Failed to resend email. Please try again later.',
  'auth.resendEmail': 'Resend email',

  'meta.loginTitle': 'Log in',
  'meta.loginDescription': 'Log in to Setlist Maker.',
  'meta.signupTitle': 'Sign up',
  'meta.signupDescription': 'Create a Setlist Maker account.',
  'meta.forgotTitle': 'Reset password',
  'meta.forgotDescription': 'Reset your Setlist Maker password.',
  'meta.resetTitle': 'New password',
  'meta.resetDescription': 'Set a new Setlist Maker password.',

  'validation.emailRequired': 'Please enter your email address',
  'validation.emailInvalid': 'Please enter a valid email address',
  'validation.passwordRequired': 'Please enter your password',
  'validation.passwordMin': 'Password must be at least 6 characters',
  'validation.passwordMax': 'Password must be 128 characters or fewer',
  'validation.passwordConfirmRequired': 'Please confirm your password',
  'validation.passwordMismatch': 'Passwords do not match',
  'validation.bandNameRequired': 'Please enter a band name',
  'validation.bandNameMax': 'Band name must be 100 characters or fewer',
  'validation.genreMax': 'Genre must be 50 characters or fewer',
  'validation.privacyRequired': 'Please agree to the Privacy Policy',

  'common.close': 'Close',

  'meta.privacyTitle': 'Privacy Policy',
  'meta.privacyDescription': 'Privacy Policy for Setlist Maker.',

  'privacy.title': 'Privacy Policy',
  'privacy.lastUpdated': 'Last updated: {date}',
  'privacy.s1.title': '1. Introduction',
  'privacy.s1.body':
    'This Privacy Policy explains how Setlist Maker (“the Service”) handles personal information. By using the Service, you agree to this policy.',
  'privacy.s2.title': '2. Information We Collect',
  'privacy.s2.intro': 'We may collect the following information:',
  'privacy.s2.item1': 'Email address',
  'privacy.s2.item2': 'Password (stored encrypted)',
  'privacy.s2.item3': 'Band name',
  'privacy.s2.item4': 'Band genre',
  'privacy.s2.item5': 'Other information necessary to provide the Service',
  'privacy.s3.title': '3. How We Use Information',
  'privacy.s3.intro': 'We use collected information for the following purposes:',
  'privacy.s3.item1': 'Providing and operating the Service',
  'privacy.s3.item2': 'User authentication',
  'privacy.s3.item3': 'Responding to inquiries',
  'privacy.s3.item4': 'Analysis to improve the Service',
  'privacy.s4.title': '4. Information Management',
  'privacy.s4.body':
    'We manage your personal information appropriately and take reasonable security measures against risks such as unauthorized access, loss, destruction, alteration, and leakage.',
  'privacy.s5.title': '5. Sharing with Third Parties',
  'privacy.s5.body':
    'Except where required by law, we will not provide your personal information to third parties without your consent.',
  'privacy.s6.title': '6. Third-Party Services',
  'privacy.s6.intro':
    'The Service uses the following third-party services, and data may be shared with them as needed:',
  'privacy.s6.item1': 'Supabase (authentication and database)',
  'privacy.s6.item2': 'Vercel (hosting)',
  'privacy.s6.outro':
    'These services process data according to their own privacy policies.',
  'privacy.s7.title': '7. Cookies and Local Storage',
  'privacy.s7.body':
    'The Service may use browser cookies and local storage to maintain authentication state and improve convenience.',
  'privacy.s8.title': '8. Your Rights',
  'privacy.s8.body':
    'You may request disclosure, correction, or deletion of your information. Please contact us via the inquiry form if you would like to do so.',
  'privacy.s9.title': '9. Changes to This Policy',
  'privacy.s9.body':
    'This policy may be updated as needed. We will announce material changes on the Service.',
  'privacy.backToSignup': 'Back to sign up',
}

export type MessageKey = keyof typeof en

const ja: Record<MessageKey, string> = {
  'lang.label': '言語',
  'lang.en': 'English',
  'lang.ja': '日本語',

  'nav.home': 'ホーム',
  'nav.settings': '設定',
  'nav.admin': '管理',
  'nav.logout': 'ログアウト',

  'auth.beta': 'Setlist Maker β Version 0.99.000',
  'auth.loginTitle': 'ログイン',
  'auth.signupTitle': 'サインアップ',
  'auth.forgotTitle': 'パスワード再設定',
  'auth.resetTitle': '新しいパスワード',
  'auth.email': 'メールアドレス',
  'auth.password': 'パスワード',
  'auth.passwordConfirm': 'パスワード再入力',
  'auth.newPassword': '新しいパスワード',
  'auth.newPasswordConfirm': '新しいパスワード（確認）',
  'auth.bandName': 'バンド名*',
  'auth.genre': 'バンドのジャンル',
  'auth.login': 'ログイン',
  'auth.signup': '登録する',
  'auth.processing': '処理中...',
  'auth.sending': '送信中...',
  'auth.updating': '更新中...',
  'auth.resending': '再送中...',
  'auth.forgotLink': 'パスワードをお忘れですか？',
  'auth.signupLink': 'サインアップはこちら',
  'auth.loginLink': 'ログインに戻る',
  'auth.sendResetEmail': '再設定メールを送る',
  'auth.updatePassword': 'パスワードを更新',
  'auth.goToLogin': 'ログインへ',
  'auth.resendReset': '再設定メールを送り直す',
  'auth.resendConfirm': '確認メールを再送する',
  'auth.privacyAgreePrefix': '',
  'auth.privacyPolicy': 'プライバシーポリシー',
  'auth.privacyAgreeSuffix': 'に同意する*',
  'auth.forgotDesc':
    '登録済みのメールアドレスを入力してください。再設定用のリンクをお送りします。',
  'auth.preparing': '準備中...',
  'auth.emailRequiredBoth': 'メールアドレスとパスワードを入力してください',
  'auth.resendNeedEmail': '再送するメールアドレスを入力してください。',
  'auth.loginError': 'ログインエラー: {message}',
  'auth.genericError': 'エラーが発生しました: {message}',
  'auth.unknownError': '不明なエラー',
  'auth.invalidCredentials': 'メールアドレスまたはパスワードが正しくありません',
  'auth.emailNotConfirmed': 'メール確認が必要です。メールを確認してください。',
  'auth.resendFailed': '確認メールの再送に失敗しました: {message}',
  'auth.resendSuccess': '確認メールを再送しました。メールをご確認ください。',
  'auth.emailExists': 'すでに利用されているメールアドレスです',
  'auth.signupFailed': 'サインアップに失敗しました。時間をおいて再度お試しください。',
  'auth.signupError': 'サインアップエラー: {message}',
  'auth.emailCheckFailed':
    'メール重複チェックに失敗したため、そのままサインアップ処理を続行します',
  'auth.emailCheckConfigMissing':
    'メール重複チェックの設定が不足しているため、そのままサインアップ処理を続行します',
  'auth.resetSendFailed': '送信に失敗しました: {message}',
  'auth.resetSent':
    '再設定用メールを送信しました。メール内のリンクから新しいパスワードを設定してください。',
  'auth.resetLinkExpired':
    '再設定リンクの有効期限が切れています。もう一度メールを送信してください。',
  'auth.resetLinkInvalid':
    '再設定リンクが無効です。もう一度メールを送信してください。',
  'auth.resetSessionFailed':
    '再設定セッションの確立に失敗しました。リンクを再送してください。',
  'auth.resetPrepareFailed': '再設定の準備中にエラーが発生しました。',
  'auth.resetUpdateFailed': 'パスワードの更新に失敗しました: {message}',
  'auth.resetSuccess':
    'パスワードを更新しました。新しいパスワードでログインしてください。',
  'auth.verifyExpired':
    '認証リンクの有効期限が切れています。確認メールを再送してください。',
  'auth.verifyFailed': 'メール認証に失敗しました。もう一度お試しください。',
  'auth.verifySuccess': 'メール認証が完了しました。ログインしてください。',
  'auth.emailSentTitle': '記載のメールアドレスに確認メールを送りました',
  'auth.emailSentResentTitle': '確認メールを再送しました',
  'auth.emailSentBody': 'メール内のリンクをクリックして、アカウントを有効化してください。',
  'auth.emailResendFailed': 'メールの再送に失敗しました。時間をおいて再度お試しください。',
  'auth.resendEmail': 'メールを再送する',

  'meta.loginTitle': 'ログイン',
  'meta.loginDescription': 'Setlist Makerのログイン画面です。',
  'meta.signupTitle': 'サインアップ',
  'meta.signupDescription': 'Setlist Makerのサインアップ画面です。',
  'meta.forgotTitle': 'パスワード再設定',
  'meta.forgotDescription': 'Setlist Makerのパスワード再設定画面です。',
  'meta.resetTitle': '新しいパスワード',
  'meta.resetDescription': 'Setlist Makerの新しいパスワード設定画面です。',

  'validation.emailRequired': 'メールアドレスを入力してください',
  'validation.emailInvalid': '有効なメールアドレスを入力してください',
  'validation.passwordRequired': 'パスワードを入力してください',
  'validation.passwordMin': 'パスワードは6文字以上で入力してください',
  'validation.passwordMax': 'パスワードは128文字以内で入力してください',
  'validation.passwordConfirmRequired': 'パスワード再入力を行ってください',
  'validation.passwordMismatch': 'パスワードが一致しません',
  'validation.bandNameRequired': 'バンド名を入力してください',
  'validation.bandNameMax': 'バンド名は100文字以内で入力してください',
  'validation.genreMax': 'バンドジャンルは50文字以内で入力してください',
  'validation.privacyRequired': 'プライバシーポリシーに同意してください',

  'common.close': '閉じる',

  'meta.privacyTitle': 'プライバシーポリシー',
  'meta.privacyDescription': 'Setlist Makerのプライバシーポリシーです。',

  'privacy.title': 'プライバシーポリシー',
  'privacy.lastUpdated': '最終更新日: {date}',
  'privacy.s1.title': '1. はじめに',
  'privacy.s1.body':
    '本プライバシーポリシーは、Setlist Maker（以下「当サービス」）における個人情報の取り扱いについて説明するものです。当サービスをご利用いただく際には、本ポリシーに同意していただく必要があります。',
  'privacy.s2.title': '2. 収集する情報',
  'privacy.s2.intro': '当サービスでは、以下の情報を収集する場合があります：',
  'privacy.s2.item1': 'メールアドレス',
  'privacy.s2.item2': 'パスワード（暗号化して保存）',
  'privacy.s2.item3': 'バンド名',
  'privacy.s2.item4': 'バンドジャンル',
  'privacy.s2.item5': 'その他、サービス提供に必要な情報',
  'privacy.s3.title': '3. 情報の利用目的',
  'privacy.s3.intro': '収集した情報は、以下の目的で利用します：',
  'privacy.s3.item1': 'サービスの提供・運営',
  'privacy.s3.item2': 'ユーザー認証',
  'privacy.s3.item3': 'お問い合わせへの対応',
  'privacy.s3.item4': 'サービス改善のための分析',
  'privacy.s4.title': '4. 情報の管理',
  'privacy.s4.body':
    '当サービスは、お客様の個人情報を適切に管理し、不正アクセス、紛失、破壊、改ざん、漏洩などのリスクに対して適切なセキュリティ対策を講じます。',
  'privacy.s5.title': '5. 第三者への提供',
  'privacy.s5.body':
    '当サービスは、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。',
  'privacy.s6.title': '6. 使用する外部サービス',
  'privacy.s6.intro':
    '当サービスでは、以下の外部サービスを利用し、必要な範囲でデータが提供される場合があります。',
  'privacy.s6.item1': 'Supabase（認証・データベース管理）',
  'privacy.s6.item2': 'Vercel（ホスティングサービス）',
  'privacy.s6.outro':
    'これらのサービスは、それぞれのプライバシーポリシーに基づいてデータを処理します。',
  'privacy.s7.title': '7. クッキー・ローカルストレージの利用',
  'privacy.s7.body':
    '当サービスでは、認証状態の保持や利便性向上のため、ブラウザのクッキーおよびローカルストレージを利用する場合があります。',
  'privacy.s8.title': '8. ユーザーの権利',
  'privacy.s8.body':
    'ユーザーは、自身の情報の開示、訂正、削除を求めることができます。ご希望の場合は、お問い合わせフォームよりご連絡ください。',
  'privacy.s9.title': '9. プライバシーポリシーの変更',
  'privacy.s9.body':
    '本ポリシーは必要に応じて変更される場合があります。重要な変更がある場合は、当サービス上で告知します。',
  'privacy.backToSignup': 'サインアップページに戻る',
}

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en,
  ja,
}

export const translate = (
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string>
): string => {
  let text = messages[locale][key] ?? messages.en[key] ?? key
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, value)
    }
  }
  return text
}
