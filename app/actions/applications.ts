"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/roles"

export async function updateApplicationStatus(formData: FormData) {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"], "manage_applications")

  const id = formData.get("id")?.toString().trim()
  const status = formData.get("status")?.toString().trim()
  const type = formData.get("type")?.toString().trim()

  if (!id || !status || !type) return

  if (type === "membership") {
    await prisma.membershipApplication.update({
      where: { id },
      data: { status },
    })
    revalidatePath(`/admin/applications/membership/${id}`)
  } else if (type === "volunteer") {
    await prisma.volunteerApplication.update({
      where: { id },
      data: { status },
    })
    revalidatePath(`/admin/applications/volunteer/${id}`)
  } else if (type === "internship") {
    await prisma.internshipApplication.update({
      where: { id },
      data: { status },
    })
    revalidatePath(`/admin/applications/internship/${id}`)
  } else if (type === "contact") {
    await prisma.contactMessage.update({
      where: { id },
      data: { status },
    })
  }

  revalidatePath("/admin/applications")
}
