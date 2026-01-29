import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/roles"
import { logAudit } from "@/lib/audit"
import { RoleEditor } from "@/components/admin/role-editor"
import { SubmitButton } from "@/components/submit-button"


async function updateRole(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN"], "manage_users")
  
  const roleId = formData.get("roleId")?.toString()
  const name = formData.get("name")?.toString()
  const permissionsJson = formData.get("permissions")?.toString()
  
  if (!roleId || !name) return

  const PROTECTED_ROLES = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"]
  const currentRole = await prisma.role.findUnique({ where: { id: roleId } })
  if (!currentRole) return

  // Don't allow renaming protected roles
  let finalName = name
  if (PROTECTED_ROLES.includes(currentRole.name)) {
      finalName = currentRole.name
  }

  const permissionConnect: { id: string }[] = []
  if (permissionsJson) {
      const actions = JSON.parse(permissionsJson) as string[]
      
      for (const action of actions) {
          const existing = await prisma.permission.findFirst({ where: { action } })
          if (existing) {
              permissionConnect.push({ id: existing.id })
          } else {
              const created = await prisma.permission.create({
                  data: { action, module: "system" }
              })
              permissionConnect.push({ id: created.id })
          }
      }
  }

  await prisma.role.update({
      where: { id: roleId },
      data: {
          name: finalName,
          permissions: {
              set: [],
              connect: permissionConnect
          }
      }
  })

  await logAudit({
    userId: null,
    route: "/admin/users",
    method: "POST",
    status: 200,
    ip: null,
    details: `role-updated: ${finalName}`
  })

  revalidatePath("/admin/users")
}

async function updateUserRole(formData: FormData) {
  "use server"

  const { session, role: currentUserRole } = await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_users")
  
  // Strict Hierarchy Check for Update
  // For fixed hierarchies, we define them here.
  // For Admin/SYSTEM_ADMIN, we allow assigning ANY role (dynamic).
  const allowedHierarchy: Record<string, string[]> = {
    "SUPER_ADMIN": ["SOCIETY_ADMIN"],
    "SOCIETY_ADMIN": ["CHAIRMAN", "PRESIDENT", "SECRETARY", "TREASURER", "COMMITTEE_MEMBER", "GENERAL_MEMBER"],
  }

  const userId = formData.get("userId")?.toString().trim() ?? ""
  const roleIdRaw = formData.get("roleId")?.toString().trim()
  const expiresAtRaw = formData.get("expiresAt")?.toString().trim()

  if (!userId) return

  const actorId = (session?.user as { id?: string } | undefined)?.id ?? null

  if (actorId && actorId === userId) {
    await logAudit({
      userId: actorId,
      route: "/admin/users",
      method: "POST",
      status: 403,
      ip: null,
      details: "self-role-change-blocked",
    })
    return
  }

  // Verify if the target role is allowed for the current user
  let assignableRoleNames: string[] = []
  if (["Admin", "SYSTEM_ADMIN"].includes(currentUserRole || "")) {
     // Super users can assign ANY role
     const allRoles = await prisma.role.findMany({ select: { name: true } })
     assignableRoleNames = allRoles.map(r => r.name)
  } else {
     assignableRoleNames = currentUserRole ? (allowedHierarchy[currentUserRole] || []) : []
  }
  
  // Also check if the roleId is valid (exists in database and is allowed)
  let finalRoleId: string | null = null
  if (roleIdRaw && roleIdRaw.length > 0) {
     const targetRole = await prisma.role.findUnique({ where: { id: roleIdRaw } })
     if (!targetRole || !assignableRoleNames.includes(targetRole.name)) {
        await logAudit({
          userId: actorId,
          route: "/admin/users",
          method: "POST",
          status: 403,
          ip: null,
          details: "unauthorized-role-assignment",
        })
        return 
     }
     finalRoleId = roleIdRaw
  }

  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  const data: { roleId: string | null; expiresAt?: Date | null } = {
    roleId: finalRoleId,
    expiresAt,
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data,
  })

  await logAudit({
    userId: actorId,
    route: "/admin/users",
    method: "POST",
    status: 200,
    ip: null,
    details: updated.roleId ?? "role-cleared",
  })

  revalidatePath("/admin/users")
}

async function createRole(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN"], "manage_users") // High-level only
  
  const name = formData.get("name")?.toString().trim()
  if (!name) return

  // Prevent creating protected role names if not authorized, or general safety
  // Ideally we should have a list of system roles, but for now allow dynamic.
  
  try {
    await prisma.role.create({
      data: { name }
    })
    revalidatePath("/admin/users")
  } catch (e) {
    console.error("Failed to create role", e)
  }
}

async function deleteRole(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN"], "manage_users")

  const roleId = formData.get("roleId")?.toString().trim()
  if (!roleId) return

  const role = await prisma.role.findUnique({ where: { id: roleId } })
  if (!role) return

  // Prevent deleting critical core roles to avoid system lockout
  const PROTECTED_ROLES = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"]
  if (PROTECTED_ROLES.includes(role.name)) {
      // In a real app we might return an error, but here we just ignore
      return 
  }

  // 1. Unassign this role from all users (Safety: Users become role-less instead of deleted)
  await prisma.user.updateMany({
    where: { roleId },
    data: { roleId: null }
  })

  // 2. Delete the role
  await prisma.role.delete({
    where: { id: roleId }
  })

  await logAudit({
    userId: null,
    route: "/admin/users",
    method: "POST",
    status: 200,
    ip: null,
    details: `role-deleted: ${role.name}`
  })

  revalidatePath("/admin/users")
}

// async function createUser(formData: FormData) {
//   "use server"
//
//   const { session, role: currentUserRole } = await requireRole(["SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "Admin"], "manage_users")
//
//   const name = formData.get("name")?.toString().trim() ?? ""
//   const email = formData.get("email")?.toString().trim() ?? ""
//   const passwordRaw = formData.get("password")?.toString() ?? ""
//   const roleIdRaw = formData.get("roleId")?.toString().trim() || null
//   const expiresAtRaw = formData.get("expiresAt")?.toString().trim()
//
//   if (!name || !email || !passwordRaw) return
//
//   const allowedHierarchy: Record<string, string[]> = {
//     "SUPER_ADMIN": ["SOCIETY_ADMIN"],
//     "SOCIETY_ADMIN": ["CHAIRMAN", "PRESIDENT", "SECRETARY", "TREASURER", "COMMITTEE_MEMBER", "GENERAL_MEMBER"],
//   }
//   
//   // Verify if the target role is allowed for the current user
//   let assignableRoleNames: string[] = []
//   if (["Admin", "SYSTEM_ADMIN"].includes(currentUserRole || "")) {
//      const allRoles = await prisma.role.findMany({ select: { name: true } })
//      assignableRoleNames = allRoles.map(r => r.name)
//   } else {
//      assignableRoleNames = currentUserRole ? (allowedHierarchy[currentUserRole] || []) : []
//   }
//
//   let finalRoleId: string | null = null
//   if (roleIdRaw && roleIdRaw.length > 0) {
//      const targetRole = await prisma.role.findUnique({ where: { id: roleIdRaw } })
//      if (!targetRole || !assignableRoleNames.includes(targetRole.name)) {
//         return // Silently fail or handle error
//      }
//      finalRoleId = roleIdRaw
//   }
//
//   const password = await hash(passwordRaw, 10)
//   // ... (rest of implementation would be here)
// }
//   const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null
//
//   const newUser = await prisma.user.create({
//     data: {
//       name,
//       email,
//       password,
//       roleId: finalRoleId,
//       expiresAt,
//     },
//   })
//
//   await logAudit({
//     userId: (session?.user as { id?: string } | undefined)?.id ?? null,
//     route: "/admin/users",
//     method: "POST",
//     status: 201,
//     ip: null,
//     details: `user-created: ${newUser.id}`,
//   })
//
//   revalidatePath("/admin/users")
// }

async function deactivateUser(formData: FormData) {
  "use server"

  const { session } = await requireRole(["SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "Admin"], "manage_users")

  const userId = formData.get("userId")?.toString().trim() ?? ""
  if (!userId) return

  const actorId = (session?.user as { id?: string } | undefined)?.id ?? null
  if (actorId && actorId === userId) {
    return
  }

  await prisma.user.update({
    where: { id: userId },
    data: { email: null, password: null },
  })

  await logAudit({
    userId: actorId,
    route: "/admin/users",
    method: "POST",
    status: 200,
    ip: null,
    details: "user-deactivated",
  })

  revalidatePath("/admin/users")
}

import { CreateUserForm } from "@/components/admin/create-user-form"

export default async function AdminUsersPage() {
  const { role: currentUserRole } = await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_users")

  const [users, allRoles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { role: true },
    }),
    prisma.role.findMany({ 
      orderBy: { name: "asc" },
      include: { permissions: true }
    }),
  ])

  // Filter roles based on hierarchy
  const allowedHierarchy: Record<string, string[]> = {
    "SUPER_ADMIN": ["SOCIETY_ADMIN"],
    "SOCIETY_ADMIN": ["CHAIRMAN", "PRESIDENT", "SECRETARY", "TREASURER", "COMMITTEE_MEMBER", "GENERAL_MEMBER"],
  }
  
  let assignableRoleNames: string[] = []
  if (["Admin", "SYSTEM_ADMIN"].includes(currentUserRole || "")) {
      assignableRoleNames = allRoles.map(r => r.name)
  } else {
      assignableRoleNames = currentUserRole ? (allowedHierarchy[currentUserRole] || []) : []
  }
  
  const roles = allRoles.filter(r => assignableRoleNames.includes(r.name))

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Users &amp; Roles</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Assign roles to users to control access to admin modules, finance data, and audit features.
      </p>

      {/* Role Management Section */}
      {["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN"].includes(currentUserRole || "") && (
        <section className="mb-6 rounded-lg border bg-card p-4 text-card-foreground">
          <h2 className="mb-3 text-lg font-semibold">Manage Roles</h2>
          <div className="flex gap-4">
             <form action={createRole} className="flex items-end gap-2 text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-muted-foreground">New Role Name</span>
                  <input name="name" placeholder="e.g. Event Coordinator" required className="h-9 rounded-md border border-input bg-background px-2 text-sm" />
                </div>
                <SubmitButton pendingText="Creating..." className="rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80">
                  Add Role
                </SubmitButton>
             </form>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {allRoles.map(r => (
              <div key={r.id} className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                <span>{r.name}</span>
                <RoleEditor role={r} updateRoleAction={updateRole} />
                {!["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"].includes(r.name) && (
                  <form action={deleteRole}>
                    <input type="hidden" name="roleId" value={r.id} />
                    <button type="submit" className="ml-1 text-muted-foreground hover:text-red-600 font-bold" title="Delete Role">
                      ×
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {assignableRoleNames.length > 0 && (
        <section className="mb-6 rounded-lg border bg-card p-4 text-card-foreground">
          <h2 className="mb-3 text-lg font-semibold">Create user</h2>
          <CreateUserForm roles={roles} />
        </section>
      )}

      <section className="rounded-lg border bg-card p-4 text-card-foreground">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found yet.</p>
        ) : (
          <div className="overflow-x-auto text-sm">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-2 py-2 font-normal">Name</th>
                  <th className="px-2 py-2 font-normal">Email</th>
                  <th className="px-2 py-2 font-normal">Current role</th>
                  <th className="px-2 py-2 font-normal">Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-b-0">
                    <td className="px-2 py-2 align-middle">
                      <div className="font-medium text-sm">{user.name || "(No name)"}</div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="text-xs text-muted-foreground">{user.email || ""}</div>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <span className="rounded-md border border-input px-2 py-1 text-xs text-muted-foreground">
                        {user.role?.name ?? "None"}
                      </span>
                    </td>
                    <td className="px-2 py-2 align-middle">
                      <div className="flex items-center gap-2">
                        <form action={updateUserRole} className="flex items-center gap-2 text-xs">
                          <input type="hidden" name="userId" value={user.id} />
                          <select
                            name="roleId"
                            defaultValue={user.roleId ?? ""}
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          >
                            <option value="">None</option>
                            {roles.map((role) => (
                              <option key={role.id} value={role.id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                          <input 
                            type="date" 
                            name="expiresAt" 
                            defaultValue={user.expiresAt ? new Date(user.expiresAt).toISOString().split('T')[0] : ""} 
                            className="h-8 w-32 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                            title="Expiry Date"
                          />
                          <SubmitButton
                            pendingText="Updating..."
                            className="rounded-md border border-input px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            Update
                          </SubmitButton>
                        </form>
                        <form action={deactivateUser} className="inline">
                          <input type="hidden" name="userId" value={user.id} />
                          <SubmitButton
                            pendingText="Deactivating..."
                            className="ml-2 rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 hover:text-red-700"
                          >
                            Deactivate
                          </SubmitButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
