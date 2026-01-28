"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/roles"
import { logAudit } from "@/lib/audit"
import { hash } from "bcryptjs"

export async function createUser(formData: FormData) {
  const { session, role: currentUserRole } = await requireRole(["SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "Admin"], "manage_users")

  const name = formData.get("name")?.toString().trim() ?? ""
  const email = formData.get("email")?.toString().trim() ?? ""
  const passwordRaw = formData.get("password")?.toString() ?? ""
  const roleIdRaw = formData.get("roleId")?.toString().trim() || null
  const expiresAtRaw = formData.get("expiresAt")?.toString().trim()

  if (!name || !email || !passwordRaw) return

  const allowedHierarchy: Record<string, string[]> = {
    "SUPER_ADMIN": ["SOCIETY_ADMIN"],
    "SOCIETY_ADMIN": ["CHAIRMAN", "PRESIDENT", "SECRETARY", "TREASURER", "COMMITTEE_MEMBER", "GENERAL_MEMBER"],
  }
  
  // Verify if the target role is allowed for the current user
  let assignableRoleNames: string[] = []
  if (["Admin", "SYSTEM_ADMIN"].includes(currentUserRole || "")) {
     const allRoles = await prisma.role.findMany({ select: { name: true } })
     assignableRoleNames = allRoles.map(r => r.name)
  } else {
     assignableRoleNames = currentUserRole ? (allowedHierarchy[currentUserRole] || []) : []
  }

  let finalRoleId: string | null = null
  if (roleIdRaw && roleIdRaw.length > 0) {
     const targetRole = await prisma.role.findUnique({ where: { id: roleIdRaw } })
     if (!targetRole || !assignableRoleNames.includes(targetRole.name)) {
        return // Silently fail or handle error
     }
     finalRoleId = roleIdRaw
  }

  const password = await hash(passwordRaw, 10)
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password,
      roleId: finalRoleId,
      expiresAt,
    },
  })

  await logAudit({
    userId: (session?.user as { id?: string } | undefined)?.id ?? null,
    route: "/admin/users",
    method: "POST",
    status: 201,
    ip: null,
    details: `user-created: ${newUser.id}`,
  })

  revalidatePath("/admin/users")
}
