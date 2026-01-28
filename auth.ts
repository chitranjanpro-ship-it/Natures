import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { compare } from "bcryptjs"

type UserWithRole = {
  id: string
  name: string | null
  email: string | null
  password: string | null
  roleId: string | null
  role: { name: string } | null
  institutionProfile: { id: string } | null
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) return null

        const user = (await prisma.user.findUnique({
          where: { email: email as string },
          include: { 
            role: true,
            institutionProfile: true 
          },
        })) as UserWithRole | null

        if (!user || !user.password) return null
        const ok = await compare(password, user.password).catch(() => false)
        if (!ok) return null
        return {
          id: user.id,
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role?.name ?? null,
          roleId: user.roleId ?? null,
          institutionId: user.institutionProfile?.id ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        // @ts-expect-error: augment token with role
        token.role = user.role
        // @ts-expect-error: augment token with roleId
        token.roleId = user.roleId
        // @ts-expect-error: augment token with institutionId
        token.institutionId = user.institutionId
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }
        // @ts-expect-error: expose role on session user
        session.user.role = token.role
        // @ts-expect-error: expose roleId on session user
        session.user.roleId = token.roleId
        // @ts-expect-error: expose institutionId on session user
        session.user.institutionId = token.institutionId
      }
      return session
    },
  },
})
