"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function completeInternship(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return

  const internshipId = formData.get("internshipId")?.toString()
  if (!internshipId) return

  const internship = await prisma.internshipApplication.findUnique({
    where: { id: internshipId },
  })

  if (!internship || internship.userId !== session.user.id) {
    return // Unauthorized or not found
  }

  // Only allow completion if status is Accepted or Ongoing
  if (["Accepted", "Ongoing"].includes(internship.status)) {
    await prisma.internshipApplication.update({
      where: { id: internshipId },
      data: {
        status: "Completed",
        completedAt: new Date(),
      },
    })
  }

  revalidatePath("/dashboard")
}
