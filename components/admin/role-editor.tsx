"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Role = {
  id: string
  name: string
  permissions: { action: string }[]
}

const SYSTEM_PERMISSIONS = [
  { id: "manage_users", label: "Manage Users & Roles" },
  { id: "manage_projects", label: "Manage Projects" },
  { id: "manage_donations", label: "Manage Donations (Finance)" },
  { id: "manage_applications", label: "Manage Applications" },
  { id: "manage_backgrounds", label: "Manage Backgrounds" },
  { id: "view_audit_log", label: "View Audit Log" },
]

export function RoleEditor({ role, updateRoleAction }: { role: Role, updateRoleAction: (formData: FormData) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(role.name)
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map(p => p.action))
  )
  const [isSaving, setIsSaving] = useState(false)

  // Protected roles cannot be renamed, but maybe permissions can be viewed?
  // Actually, core roles usually have full access via code, but we can still show them.
  const isProtected = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"].includes(role.name)

  if (!isEditing) {
    return (
      <button 
        onClick={() => setIsEditing(true)} 
        className="ml-1 text-muted-foreground hover:text-blue-600 font-bold px-1" 
        title="Edit Role"
      >
        ✎
      </button>
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    const formData = new FormData()
    formData.append("roleId", role.id)
    formData.append("name", name)
    formData.append("permissions", JSON.stringify(Array.from(selectedPermissions)))
    
    await updateRoleAction(formData)
    setIsSaving(false)
    setIsEditing(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Edit Role: {role.name}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Role Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              disabled={isProtected}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
            />
            {isProtected && <p className="mt-1 text-xs text-muted-foreground">System roles cannot be renamed.</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Permissions</label>
            <div className="space-y-2 rounded-md border p-3">
              {SYSTEM_PERMISSIONS.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 text-sm">
                  <input 
                    type="checkbox"
                    checked={selectedPermissions.has(perm.id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedPermissions)
                      if (e.target.checked) newSet.add(perm.id)
                      else newSet.delete(perm.id)
                      setSelectedPermissions(newSet)
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={() => setIsEditing(false)}
              className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-accent"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
