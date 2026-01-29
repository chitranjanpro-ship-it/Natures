import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      /** The user's role. */
      role: string | null
      /** The user's role ID. */
      roleId: string | null
      /** The user's institution ID. */
      institutionId: string | null
    } & DefaultSession["user"]
  }

  interface User {
      role: string | null
      roleId: string | null
      institutionId: string | null
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    role: string | null
    roleId: string | null
    institutionId: string | null
  }
}
