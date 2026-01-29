"use server"

import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"

export async function registerInstitution(formData: FormData) {
  const orgName = formData.get("orgName")?.toString().trim()
  const orgType = formData.get("orgType")?.toString().trim()
  const address = formData.get("address")?.toString().trim()
  const website = formData.get("website")?.toString().trim()
  
  const contactName = formData.get("contactName")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim()
  
  const email = formData.get("email")?.toString().trim()
  const password = formData.get("password")?.toString().trim()

  if (!orgName || !contactName || !email || !password || !orgType) {
    return { error: "Missing required fields" }
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already registered" }
  }

  const hashedPassword = await hash(password, 10)

  // Create User + Institution Profile
  await prisma.user.create({
    data: {
      name: orgName, // User name is Org Name for simplicity
      email,
      password: hashedPassword,
      institutionProfile: {
        create: {
          organizationName: orgName,
          type: orgType,
          contactPerson: contactName,
          contactPhone: phone,
          address,
          website,
          status: "Pending" // Needs admin approval? Or allow immediate access?
        }
      }
    }
  })

  redirect("/auth/signin?success=InstitutionRegistered")
}
