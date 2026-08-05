import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
    accessToken?: string
    refreshToken?: string
    error?: string
    isAdmin?: boolean
  }

  interface User {
    id: string
    email?: string | null
    name?: string | null
    image?: string | null
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    accessToken?: string
    refreshToken?: string
    accessTokenExpiresAt?: number
    error?: string
  }
}
