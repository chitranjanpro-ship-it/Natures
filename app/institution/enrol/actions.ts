"use server"

import { auth } from "@/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import { sendCredentialsEmail, sendEnrollmentConfirmation } from "@/lib/email"

// Helper to generate a random password
function generatePassword() {
  return Math.random().toString(36).slice(-8)
}

export async function submitEnrollment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: "Not authenticated" }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { institutionProfile: true }
  })

  if (!user?.institutionProfile) return { error: "Not an institution" }
  if (user.institutionProfile.status !== 'Approved') return { error: "Institution not approved" }

  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim()
  const course = formData.get("course")?.toString().trim()
  const duration = formData.get("duration")?.toString().trim()
  const domainId = formData.get("domainId")?.toString().trim()
  const batch = formData.get("batch")?.toString().trim() // Vertical/Batch

  if (!name || !email || !domainId) return { error: "Missing required fields" }

  // Check if user exists, if not create one
  let userId = null
  let userPassword = null
  
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    userId = existingUser.id
  } else {
    userPassword = generatePassword()
    const hashedPassword = await hash(userPassword, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: { connect: { name: "Student" } } // Assuming 'Student' role exists or will default
      }
    })
    userId = newUser.id
  }

  await prisma.internshipApplication.create({
    data: {
      name,
      email,
      phone,
      course,
      duration,
      domainId,
      batch,
      institution: user.institutionProfile.organizationName,
      institutionId: user.institutionProfile.id,
      userId,
      applicantType: "Student",
      status: "Pending",
    }
  })

  // Send emails
  if (userId && userPassword) {
    await sendCredentialsEmail(email, name, userPassword)
  }
  await sendEnrollmentConfirmation(email, name, course || "Internship", user.institutionProfile.organizationName)

  redirect("/institution/dashboard?enrolled=1")
}

export async function submitBulkEnrollment(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) return { error: "Not authenticated" }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { institutionProfile: true }
  })

  if (!user?.institutionProfile || user.institutionProfile.status !== 'Approved') {
    return { error: "Unauthorized" }
  }

  const batch = formData.get("batch")?.toString().trim()
  const domainId = formData.get("domainId")?.toString().trim()
  const bulkData = formData.get("bulkData")?.toString().trim()

  if (!bulkData || !domainId) return { error: "Missing data" }

  const lines = bulkData.split('\n')
  let count = 0

  for (const line of lines) {
    // Format: Name, Email, Phone, Course, Duration
    const parts = line.split(',').map(p => p.trim())
    if (parts.length < 2) continue

    const [name, email, phone, course, duration] = parts
    if (!name || !email) continue

    // Check if user exists
    let userId = null
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      userId = existingUser.id
    } else {
      const password = generatePassword()
      const hashedPassword = await hash(password, 10)
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          // role...
        }
      })
      userId = newUser.id
      // TODO: Queue email
    }

    await prisma.internshipApplication.create({
      data: {
        name,
        email,
        phone: phone || null,
        course: course || null,
        duration: duration || "1 Month", // Default
        domainId,
        batch,
        institution: user.institutionProfile.organizationName,
        institutionId: user.institutionProfile.id,
        userId,
        applicantType: "Student",
        status: "Pending",
      }
    })
    count++
  }

  redirect(`/institution/dashboard?enrolled=${count}`)
}
