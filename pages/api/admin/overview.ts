import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdminSession } from "@/utils/requireAdminSession"
import { getSupabaseAdmin } from "@/utils/supabaseAdmin"

export type AdminUserRow = {
  id: string
  email: string | null
  bandName: string | null
  emailConfirmed: boolean
  createdAt: string | null
  lastSignInAt: string | null
}

export type AdminBandRow = {
  id: string
  name: string
  userId: string
  genre: string | null
  logoUrl: string | null
  createdAt: string | null
}

export type AdminOverviewResponse = {
  stats: {
    userCount: number
    confirmedUserCount: number
    bandCount: number
  }
  users: AdminUserRow[]
  bands: AdminBandRow[]
  error?: string
}

const listAllUsers = async () => {
  const admin = getSupabaseAdmin()
  const perPage = 200
  let page = 1
  const users: AdminUserRow[] = []

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) {
      throw new Error(error.message)
    }

    const pageUsers = data?.users ?? []
    for (const user of pageUsers) {
      users.push({
        id: user.id,
        email: user.email ?? null,
        bandName: null,
        emailConfirmed: Boolean(user.email_confirmed_at),
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
      })
    }

    if (pageUsers.length < perPage) {
      break
    }
    page += 1
  }

  return users
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AdminOverviewResponse | { error: string }>
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const session = await requireAdminSession(req, res)
  if (!session) {
    return
  }

  try {
    const admin = getSupabaseAdmin()
    const users = await listAllUsers()

    const { data: bandsData, error: bandsError } = await admin
      .from("bands")
      .select("id, name, user_id, genre, logo_url, created_at")
      .order("created_at", { ascending: false })

    if (bandsError) {
      return res.status(500).json({ error: bandsError.message })
    }

    const bands: AdminBandRow[] = (bandsData ?? []).map((band) => ({
      id: band.id,
      name: band.name,
      userId: band.user_id,
      genre: band.genre ?? null,
      logoUrl: band.logo_url ?? null,
      createdAt: band.created_at ?? null,
    }))

    const bandNameByUserId = new Map<string, string>()
    for (const band of bands) {
      if (band.userId && band.name) {
        bandNameByUserId.set(band.userId, band.name)
      }
    }

    const usersWithBand = users.map((user) => ({
      ...user,
      bandName: bandNameByUserId.get(user.id) ?? null,
    }))

    return res.status(200).json({
      stats: {
        userCount: usersWithBand.length,
        confirmedUserCount: usersWithBand.filter((user) => user.emailConfirmed).length,
        bandCount: bands.length,
      },
      users: usersWithBand,
      bands,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected error"
    return res.status(500).json({ error: message })
  }
}
