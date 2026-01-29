"use server"

import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { sendApplicationReceivedEmail } from "@/lib/email"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { hash } from "bcryptjs"

export async function submitInternship(formData: FormData) {
  const session = await auth()
  let userId = session?.user?.id

  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim() || null
  const institution = formData.get("institution")?.toString().trim()
  const course = formData.get("course")?.toString().trim() || null
  const duration = formData.get("duration")?.toString().trim() || null
  const domainId = formData.get("domainId")?.toString().trim()
  const applicantType = formData.get("applicantType")?.toString().trim() || "Student"
  const password = formData.get("password")?.toString().trim()
  
  const letterFile = formData.get("letter") as File | null

  if (!name || !email || !institution || !domainId) {
    console.error("Missing fields:", { name, email, institution, domainId })
    return
  }

  // Auto-signup logic for guest users
  let shouldLogin = false
  if (!userId) {
    if (password) {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        // We can't log them in automatically if they already exist (security risk)
        // But we can link the application if they login later? 
        // For now, let's just create the application without user linkage or throw error.
        // User request: "no need to signup and signin again".
        // Best approach: If user exists, we probably should have asked them to login. 
        // But to be helpful, we'll create the application linked to the user if we could, but we can't trust the email.
        // So we will just proceed with creating the application with NO userId, and maybe they can claim it later.
        // OR we return an error.
        // However, for the 'happy path' of a new user:
      } else {
        // Create new user
        const hashedPassword = await hash(password, 10)
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          }
        })
        userId = newUser.id
        shouldLogin = true
      }
    }
  }

  let letterUrl = null
  if (letterFile && letterFile.size > 0) {
    try {
      const bytes = await letterFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const uploadDir = join(process.cwd(), "public/uploads/internship-letters")
      await mkdir(uploadDir, { recursive: true })

      const fileName = `${Date.now()}-${letterFile.name.replace(/[^a-zA-Z0-9.-]/g, "")}`
      const filePath = join(uploadDir, fileName)
      
      await writeFile(filePath, buffer)
      letterUrl = `/uploads/internship-letters/${fileName}`
    } catch (error) {
      console.error("File upload error:", error)
    }
  }

  await prisma.internshipApplication.create({
    data: {
      name,
      email,
      phone,
      institution,
      course,
      duration,
      domainId,
      letterUrl,
      userId,
      applicantType, 
    },
  })

  // Send confirmation email
  await sendApplicationReceivedEmail(email, name, institution).catch(err => console.error("Email failed:", err))

  if (shouldLogin && password) {
    // No auto-login per user request
    redirect("/auth/signin?success=InternshipApplicationCreated")
  }

  // If already logged in, redirect to dashboard to see progress
  if (session?.user) {
    redirect("/dashboard")
  }
  
  // Fallback for existing users not logged in (they need to login to see it)
  redirect("/internships?success=1")
}

export async function registerInstitutionFromInternship(formData: FormData) {
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
      name: orgName, // User name is Org Name
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
          status: "Pending"
        }
      }
    }
  })

  // No auto-login per user request
  redirect("/auth/signin?success=InstitutionRegistered")
}
