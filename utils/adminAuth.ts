/**
 * 管理者判定（メールアドレスのホワイトリスト）
 * ADMIN_EMAILS はカンマ区切り。例: admin@example.com,owner@example.com
 */
export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false

  const raw = process.env.ADMIN_EMAILS || ""
  const allowed = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  if (allowed.length === 0) {
    return false
  }

  return allowed.includes(email.trim().toLowerCase())
}
