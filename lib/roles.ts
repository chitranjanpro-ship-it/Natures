import { auth } from "@/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"

type RoleSessionUser = {
  role?: string | null
}

export async function checkRole(allowedRoles: string[], requiredPermission?: string) {
  const session = await auth()
  const sessionRole = session?.user ? (session.user as RoleSessionUser).role : null
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!session?.user || !userId) {
    return { authorized: false, error: "Unauthorized" }
  }

  // Fetch user for expiry and accurate role check
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      expiresAt: true, 
      roleId: true,
      role: {
        select: {
          name: true,
          accessStartDate: true,
          accessEndDate: true,
          permissions: { select: { action: true } }
        }
      }
    }
  })

  if (user?.expiresAt && user.expiresAt < new Date()) {
    return { authorized: false, error: "SessionExpired" }
  }

  // Check Role Time Limits
  if (user?.role) {
    const now = new Date()
    if (user.role.accessStartDate && user.role.accessStartDate > now) {
      return { authorized: false, error: "Forbidden" } // Role not yet active
    }
    if (user.role.accessEndDate && user.role.accessEndDate < now) {
      return { authorized: false, error: "Forbidden" } // Role expired
    }
  }

  const role = user?.role?.name || sessionRole

  // 1. Check Role Name
  if (role && allowedRoles.includes(role)) {
    return { authorized: true, session, role, userId }
  }

  // 2. Check Permissions via Role ID
  if (requiredPermission && user?.role?.permissions) {
    if (user.role.permissions.some(p => p.action === requiredPermission)) {
      return { authorized: true, session, role, userId }
    }
  }

  return { authorized: false, error: "Forbidden" }
}

export async function requireRole(allowedRoles: string[], requiredPermission?: string) {
  const result = await checkRole(allowedRoles, requiredPermission)
  
  if (!result.authorized) {
    if (result.error === "SessionExpired") {
      redirect("/login?error=SessionExpired")
    }
    redirect("/login")
  }

  // Additional Society Admin Check
  if (result.role === "SOCIETY_ADMIN" && result.userId) {
    const member = await prisma.member.findUnique({ where: { userId: result.userId } })
    const now = Date.now()
    const expired = Boolean(member?.expiryDate) && new Date(member!.expiryDate!).getTime() < now
    const inactive = member?.status && member.status.toLowerCase() !== "active"
    if (expired || inactive) {
      redirect("/login")
    }
  }

  return { session: result.session!, role: result.role }
}

export async function requireAnyAdminAccess() {
  const session = await auth()
  const sessionRole = session?.user ? (session.user as RoleSessionUser).role : null
  const userId = (session?.user as { id?: string } | undefined)?.id

  if (!session?.user || !userId) {
    redirect("/login")
  }

  // Check general user expiry
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      expiresAt: true, 
      roleId: true,
      role: {
        select: {
          name: true,
          accessStartDate: true,
          accessEndDate: true,
          permissions: { select: { action: true } }
        }
      }
    }
  })
  
  if (user?.expiresAt && user.expiresAt < new Date()) {
    redirect("/login?error=SessionExpired")
  }

  // Check Role Time Limits
  if (user?.role) {
    const now = new Date()
    if (user.role.accessStartDate && user.role.accessStartDate > now) {
      redirect("/login")
    }
    if (user.role.accessEndDate && user.role.accessEndDate < now) {
      redirect("/login")
    }
  }

  const role = user?.role?.name || sessionRole

  const ADMIN_ROLES = [
    "Admin",
    "Finance",
    "Manager",
    "Reviewer",
    "SYSTEM_ADMIN",
    "SUPER_ADMIN",
    "SOCIETY_ADMIN",
    "SECRETARY",
    "CHAIRMAN",
    "PRESIDENT",
    "TREASURER"
  ]
  
  if (role && ADMIN_ROLES.includes(role)) {
    return { session, role }
  }

  // Check if role has ANY permissions
  if (user?.role?.permissions && user.role.permissions.length > 0) {
      // If the user has permissions, they are authorized. 
      // Return the session role (even if null) or the role name from DB.
      // Ideally we return the DB role name if available.
      return { session, role: role || "Custom Role" } 
  }

  redirect("/login")
}
