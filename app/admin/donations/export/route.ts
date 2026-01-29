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
  const { authorized } = await checkRole(["Admin", "Finance", "TREASURER"], "manage_donations")

  if (!authorized) {
    await logAudit({
      userId: session?.user?.id ?? null,
      route: "/admin/donations/export",
      method: "GET",
      status: 401,
      ip: null,
      details: "Unauthorized",
    })
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const donations = await prisma.donation.findMany({ orderBy: { date: "desc" } })

  const typed = donations as unknown as {
    id: string
    amount: number
    donorName: string
    donorEmail: string | null
    purpose: string | null
    date: Date
    isAnonymous: boolean
    receiptNo: string
    mode: string
    status: string
    reference: string | null
  }[]

  const header = [
    "Date",
    "ReceiptNo",
    "DonorName",
    "DonorEmail",
    "Amount",
    "Purpose",
    "Mode",
    "Status",
    "Reference",
  ].join(",")

  const lines = typed.map((d) => {
    const cells = [
      d.date.toISOString(),
      d.receiptNo,
      d.isAnonymous ? "Anonymous" : d.donorName,
      d.donorEmail ?? "",
      d.amount.toString(),
      d.purpose ?? "",
      d.mode,
      d.status,
      d.reference ?? "",
    ].map((v) => escapeCsvValue(v))

    return cells.join(",")
  })

  const body = [header, ...lines].join("\n")

  await logAudit({
    userId: session?.user?.id ?? null,
    route: "/admin/donations/export",
    method: "GET",
    status: 200,
    ip: null,
    details: null,
  })

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=donations.csv",
    },
  })
}
