import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { buildRateLimitKey, checkRateLimit } from "@/lib/rate-limit"
import { logAudit } from "@/lib/audit"

export async function POST(req: Request) {
  try {
    const rateKey = buildRateLimitKey(req, "signup")
    const allowed = checkRateLimit(rateKey, 10, 60_000)
    if (!allowed) {
      await logAudit({
        route: "/api/signup",
        method: "POST",
        status: 429,
        ip: rateKey.split(":")[1] ?? null,
        details: "Rate limit exceeded",
      })
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const { email, password, name, role } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Invalid" }, { status: 400 })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: "Exists" }, { status: 409 })
    
    // Handle Role Assignment
    let roleId: string | undefined;
    if (role) {
      // Allow-list for public signup roles to prevent admin role injection
      const allowedRoles = ["GENERAL_MEMBER", "VOLUNTEER", "STUDENT", "RESEARCHER", "INSTITUTION"];
      if (allowedRoles.includes(role)) {
        let roleRecord = await prisma.role.findUnique({ where: { name: role } });
        if (!roleRecord) {
          // Lazy create if it doesn't exist (ensures signup works without re-seeding)
          roleRecord = await prisma.role.create({ data: { name: role } });
        }
        roleId = roleRecord.id;
      }
    }

    const pw = await hash(password, 10)
    const user = await prisma.user.create({ 
      data: { 
        email, 
        password: pw, 
        name,
        role: roleId ? { connect: { id: roleId } } : undefined
      } 
    })
    await logAudit({
      userId: user.id,
      route: "/api/signup",
      method: "POST",
      status: 201,
      ip: rateKey.split(":")[1] ?? null,
      details: null,
    })
    const response = NextResponse.json({ id: user.id }, { status: 201 })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    await logAudit({
      route: "/api/signup",
      method: "POST",
      status: 500,
      ip: null,
      details: error instanceof Error ? error.message : "Unhandled error",
    })
    return NextResponse.json({ error: "Server" }, { status: 500 })
  }
}
