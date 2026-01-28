"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function sendMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const message = formData.get("message")?.toString().trim()
  const internshipAppId = formData.get("internshipAppId")?.toString()
  const membershipAppId = formData.get("membershipAppId")?.toString()
  const volunteerAppId = formData.get("volunteerAppId")?.toString()
  const parentId = formData.get("parentId")?.toString()
  const file = formData.get("file") as File | null
  
  // "User" or "Admin"
  const senderTypeInput = formData.get("senderType")?.toString()

  if (!message && (!file || file.size === 0)) return

  let senderType = "User"
  
  // If user claims to be Admin, verify they have admin privileges
  if (senderTypeInput === "Admin") {
    // Check if user has an admin-like role
    const userRole = session.user.role // This comes from the session callback
    const allowedAdminRoles = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"]
    
    if (userRole && allowedAdminRoles.includes(userRole)) {
      senderType = "Admin"
    } else {
      // Fallback to User if not actually an admin
      senderType = "User"
    }
  }

  // Handle file upload
  let attachmentData = undefined
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error("Error creating upload directory:", error)
    }
    
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    const filepath = path.join(uploadDir, filename)
    
    await writeFile(filepath, buffer)
    
    attachmentData = {
      url: `/uploads/${filename}`,
      name: file.name,
      type: file.type,
      size: file.size
    }
  }

  await prisma.applicationMessage.create({
    data: {
      message: message || "",
      senderId: session.user.id,
      senderType: senderType,
      senderName: session.user.name || "Unknown",
      internshipAppId: internshipAppId || null,
      membershipAppId: membershipAppId || null,
      volunteerAppId: volunteerAppId || null,
      parentId: parentId || null,
      attachments: attachmentData ? {
        create: attachmentData
      } : undefined
    },
  })

  // Revalidate paths
  if (internshipAppId) {
    revalidatePath(`/dashboard/applications/internship/${internshipAppId}`)
    revalidatePath(`/admin/applications/internship/${internshipAppId}`)
  }
  if (membershipAppId) {
    revalidatePath(`/dashboard/applications/membership/${membershipAppId}`)
    revalidatePath(`/admin/applications/membership/${membershipAppId}`)
  }
  if (volunteerAppId) {
    revalidatePath(`/dashboard/applications/volunteer/${volunteerAppId}`)
    revalidatePath(`/admin/applications/volunteer/${volunteerAppId}`)
  }
}

export async function editMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const messageId = formData.get("messageId")?.toString()
  const newContent = formData.get("message")?.toString().trim()
  
  if (!messageId || !newContent) return

  // Fetch the message to check ownership
  const existingMessage = await prisma.applicationMessage.findUnique({
    where: { id: messageId }
  })

  if (!existingMessage) {
    throw new Error("Message not found")
  }

  // Check permissions:
  // 1. User is the sender
  // 2. User is an Admin (can edit any message)
  
  const isSender = existingMessage.senderId === session.user.id
  
  const userRole = session.user.role
  const allowedAdminRoles = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"]
  const isAdmin = userRole && allowedAdminRoles.includes(userRole)

  if (!isSender && !isAdmin) {
    throw new Error("Forbidden: You can only edit your own messages or you must be an admin.")
  }

  await prisma.applicationMessage.update({
    where: { id: messageId },
    data: { message: newContent }
  })

  // Revalidate paths based on application type
  if (existingMessage.internshipAppId) {
    revalidatePath(`/dashboard/applications/internship/${existingMessage.internshipAppId}`)
    revalidatePath(`/admin/applications/internship/${existingMessage.internshipAppId}`)
  }
  if (existingMessage.membershipAppId) {
    revalidatePath(`/dashboard/applications/membership/${existingMessage.membershipAppId}`)
    revalidatePath(`/admin/applications/membership/${existingMessage.membershipAppId}`)
  }
  if (existingMessage.volunteerAppId) {
    revalidatePath(`/dashboard/applications/volunteer/${existingMessage.volunteerAppId}`)
    revalidatePath(`/admin/applications/volunteer/${existingMessage.volunteerAppId}`)
  }
}

export async function deleteMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const messageId = formData.get("messageId")?.toString()
  
  if (!messageId) return

  const existingMessage = await prisma.applicationMessage.findUnique({
    where: { id: messageId }
  })

  if (!existingMessage) {
    throw new Error("Message not found")
  }

  const isSender = existingMessage.senderId === session.user.id
  const userRole = session.user.role
  const allowedAdminRoles = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"]
  const isAdmin = userRole && allowedAdminRoles.includes(userRole)

  if (!isSender && !isAdmin) {
    throw new Error("Forbidden: You can only delete your own messages or you must be an admin.")
  }

  await prisma.applicationMessage.update({
    where: { id: messageId },
    data: { isDeleted: true }
  })

  if (existingMessage.internshipAppId) {
    revalidatePath(`/dashboard/applications/internship/${existingMessage.internshipAppId}`)
    revalidatePath(`/admin/applications/internship/${existingMessage.internshipAppId}`)
  }
  if (existingMessage.membershipAppId) {
    revalidatePath(`/dashboard/applications/membership/${existingMessage.membershipAppId}`)
    revalidatePath(`/admin/applications/membership/${existingMessage.membershipAppId}`)
  }
  if (existingMessage.volunteerAppId) {
    revalidatePath(`/dashboard/applications/volunteer/${existingMessage.volunteerAppId}`)
    revalidatePath(`/admin/applications/volunteer/${existingMessage.volunteerAppId}`)
  }
}
