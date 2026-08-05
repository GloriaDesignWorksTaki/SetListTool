import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import type { Session } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { isAdminEmail } from "@/utils/adminAuth"

/**
 * Admin API 用の認可チェック。成功時は session を返す。
 */
export const requireAdminSession = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<Session | null> => {
  const session = await getServerSession(req, res, authOptions)

  if (!session?.user?.email) {
    res.status(401).json({ error: "Unauthorized" })
    return null
  }

  if (!isAdminEmail(session.user.email)) {
    res.status(403).json({ error: "Forbidden" })
    return null
  }

  return session
}
