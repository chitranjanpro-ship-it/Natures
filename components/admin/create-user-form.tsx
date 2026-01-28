"use client"

import { useRef } from "react"
import { SubmitButton } from "@/components/submit-button"
import { createUser } from "@/app/admin/users/actions"

type Role = {
  id: string
  name: string
}

export function CreateUserForm({ roles }: { roles: Role[] }) {
  const ref = useRef<HTMLFormElement>(null)

  return (
    <form
      action={async (formData) => {
        await createUser(formData)
        ref.current?.reset()
      }}
      ref={ref}
      className="grid gap-3 md:grid-cols-4 text-xs"
    >
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Name</span>
        <input
          name="name"
          required
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          placeholder="Full Name"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Email</span>
        <input
          name="email"
          type="email"
          required
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          placeholder="email@example.com"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Password</span>
        <input
          name="password"
          type="password"
          required
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          placeholder="••••••••"
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Initial role</span>
        <select
          name="roleId"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">None</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Expiry Date (Optional)</span>
        <input
          name="expiresAt"
          type="date"
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        />
      </div>
      <div className="md:col-span-3 flex justify-end items-end">
        <SubmitButton
          pendingText="Creating..."
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Create user
        </SubmitButton>
      </div>
    </form>
  )
}
