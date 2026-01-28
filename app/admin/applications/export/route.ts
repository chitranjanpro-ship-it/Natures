import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { auth } from "@/auth"
import { logAudit } from "@/lib/audit"
import { checkRole } from "@/lib/roles"

function escapeCsvValue(value: string): string {
  if (value.includes("\"") || value.includes(",") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  const session = await auth()
  const { authorized } = await checkRole(["Admin", "Manager", "Reviewer"], "manage_applications")

  if (!authorized) {
    await logAudit({
      userId: (session?.user as { id?: string } | undefined)?.id ?? null,
      route: "/admin/applications/export",
      method: "GET",
      status: 401,
      ip: null,
      details: "Unauthorized",
    })
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const [membershipApps, volunteerApps, internshipApps, contactMessages] = await Promise.all([
    prisma.membershipApplication.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.volunteerApplication.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.internshipApplication.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ])

  const header = [
    "Type",
    "Name",
    "EmailOrPhone",
    "MembershipType/Institution",
    "Skills/Message/Details",
    "CreatedAt",
    "Status",
  ].join(",")

  const membershipLines = membershipApps.map((app: { name: string; email: string; membershipType: string; createdAt: Date; status: string }) => {
    const cells = [
      "Membership",
      app.name,
      app.email,
      app.membershipType,
      "",
      app.createdAt.toISOString(),
      app.status,
    ].map((v) => escapeCsvValue(v ?? ""))
    return cells.join(",")
  })

  const volunteerLines = volunteerApps.map((app: { name: string; phone: string | null; skills: string | null; createdAt: Date; status: string }) => {
    const cells = [
      "Volunteer",
      app.name,
      app.phone ?? "",
      "",
      app.skills ?? "",
      app.createdAt.toISOString(),
      app.status,
    ].map((v) => escapeCsvValue(v ?? ""))
    return cells.join(",")
  })

  const internshipLines = internshipApps.map((app: { name: string; email: string; phone: string | null; institution: string; course: string | null; duration: string | null; createdAt: Date; status: string }) => {
    const cells = [
      "Internship",
      app.name,
      app.email,
      app.institution,
      [app.course, app.duration].filter(Boolean).join(" - "),
      app.createdAt.toISOString(),
      app.status,
    ].map((v) => escapeCsvValue(v ?? ""))
    return cells.join(",")
  })

  const contactLines = contactMessages.map((msg: {
    firstName: string
    lastName: string | null
    email: string
    message: string
    createdAt: Date
    status: string
  }) => {
    const name = `${msg.firstName} ${msg.lastName ?? ""}`.trim()
    const cells = [
      "Contact",
      name,
      msg.email,
      "",
      msg.message,
      msg.createdAt.toISOString(),
      msg.status,
    ].map((v) => escapeCsvValue(v ?? ""))
    return cells.join(",")
  })

  const body = [header, ...membershipLines, ...volunteerLines, ...internshipLines, ...contactLines].join("\n")

  await logAudit({
    userId: (session?.user as { id?: string } | undefined)?.id ?? null,
    route: "/admin/applications/export",
    method: "GET",
    status: 200,
    ip: null,
    details: null,
  })

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=applications.csv",
    },
  })
}
