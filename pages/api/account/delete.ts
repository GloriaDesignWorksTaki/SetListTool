import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getSupabaseAdmin } from "@/utils/supabaseAdmin"

type DeleteAccountResponse = {
  ok: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DeleteAccountResponse>
) {
  if (req.method !== "DELETE" && req.method !== "POST") {
    res.setHeader("Allow", "DELETE, POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ ok: false, error: "Unauthorized" })
  }

  const userId = session.user.id
  const confirm = typeof req.body?.confirm === "string" ? req.body.confirm : ""
  if (confirm !== "DELETE") {
    return res.status(400).json({
      ok: false,
      error: '確認のため confirm に "DELETE" を送ってください',
    })
  }

  try {
    const admin = getSupabaseAdmin()

    // 先にアプリデータを削除（FK / cascade が無い場合に備える）
    const { data: bands } = await admin.from("bands").select("id").eq("user_id", userId)
    const bandIds = (bands ?? []).map((b) => b.id)

    if (bandIds.length > 0) {
      const { error: setlistsError } = await admin
        .from("setlists")
        .delete()
        .in("band_id", bandIds)
      if (setlistsError) {
        return res.status(500).json({
          ok: false,
          error: `セットリスト削除に失敗しました: ${setlistsError.message}`,
        })
      }

      const { error: songsError } = await admin
        .from("songs")
        .delete()
        .in("band_id", bandIds)
      if (songsError) {
        return res.status(500).json({
          ok: false,
          error: `曲削除に失敗しました: ${songsError.message}`,
        })
      }

      const { error: bandsError } = await admin
        .from("bands")
        .delete()
        .eq("user_id", userId)
      if (bandsError) {
        return res.status(500).json({
          ok: false,
          error: `バンド削除に失敗しました: ${bandsError.message}`,
        })
      }
    } else {
      const { error: setlistsError } = await admin
        .from("setlists")
        .delete()
        .eq("user_id", userId)
      if (setlistsError) {
        return res.status(500).json({
          ok: false,
          error: `セットリスト削除に失敗しました: ${setlistsError.message}`,
        })
      }

      const { error: bandsError } = await admin
        .from("bands")
        .delete()
        .eq("user_id", userId)
      if (bandsError) {
        return res.status(500).json({
          ok: false,
          error: `バンド削除に失敗しました: ${bandsError.message}`,
        })
      }
    }

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId)
    if (deleteUserError) {
      return res.status(500).json({
        ok: false,
        error: `アカウント削除に失敗しました: ${deleteUserError.message}`,
      })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected error"
    return res.status(500).json({ ok: false, error: message })
  }
}
