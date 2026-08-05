import type { NextApiRequest, NextApiResponse } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getSupabaseAdmin } from "@/utils/supabaseAdmin"
import type { SetlistItem } from "@/types"

type SetlistBody = {
  bandId?: string
  items?: SetlistItem[]
  eventDate?: string
  venue?: string
  eventTitle?: string
}

const isMissingTableError = (error: { code?: string; message?: string } | null) => {
  if (!error) return false
  const code = error.code || ""
  const message = (error.message || "").toLowerCase()
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find the table")
  )
}

const ensureBandOwnership = async (bandId: string, userId: string) => {
  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("bands")
    .select("id")
    .eq("id", bandId)
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message || "バンド確認に失敗しました")
  }
  return Boolean(data)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const userId = session.user.id

  try {
    if (req.method === "GET") {
      const bandId = typeof req.query.bandId === "string" ? req.query.bandId : ""
      if (!bandId) {
        return res.status(400).json({ error: "bandId is required" })
      }

      const owned = await ensureBandOwnership(bandId, userId)
      if (!owned) {
        return res.status(403).json({ error: "Forbidden" })
      }

      const admin = getSupabaseAdmin()
      const { data, error } = await admin
        .from("setlists")
        .select("id, band_id, user_id, items, event_date, venue, event_title, updated_at")
        .eq("band_id", bandId)
        .maybeSingle()

      if (error) {
        if (isMissingTableError(error)) {
          return res.status(503).json({
            error: "setlists table missing",
            code: "missing_table",
          })
        }
        return res.status(500).json({ error: error.message || "fetch failed" })
      }

      return res.status(200).json({
        setlist: data
          ? {
              ...data,
              items: Array.isArray(data.items) ? data.items : [],
            }
          : null,
      })
    }

    if (req.method === "PUT" || req.method === "POST") {
      const body = (req.body || {}) as SetlistBody
      const bandId = typeof body.bandId === "string" ? body.bandId : ""
      if (!bandId) {
        return res.status(400).json({ error: "bandId is required" })
      }

      const owned = await ensureBandOwnership(bandId, userId)
      if (!owned) {
        return res.status(403).json({ error: "Forbidden" })
      }

      const admin = getSupabaseAdmin()
      const { error } = await admin.from("setlists").upsert(
        {
          band_id: bandId,
          user_id: userId,
          items: Array.isArray(body.items) ? body.items : [],
          event_date: body.eventDate || null,
          venue: body.venue || null,
          event_title: body.eventTitle || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "band_id" }
      )

      if (error) {
        if (isMissingTableError(error)) {
          return res.status(503).json({
            error: "setlists table missing",
            code: "missing_table",
          })
        }
        return res.status(500).json({
          error: error.message || error.code || "save failed",
          code: error.code,
        })
      }

      return res.status(200).json({ ok: true })
    }

    res.setHeader("Allow", "GET, PUT, POST")
    return res.status(405).json({ error: "Method not allowed" })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected error"
    return res.status(500).json({ error: message })
  }
}
