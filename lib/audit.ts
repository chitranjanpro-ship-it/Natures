import prisma from "@/lib/db"

type AuditParams = {
  userId?: string | null
  route: string
  method: string
  status: number
  ip?: string | null
  details?: string | null
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        route: params.route,
        method: params.method,
        status: params.status,
        ip: params.ip || null,
        details: params.details || null,
      },
    })
  } catch {
    // Ignore audit log errors to prevent blocking main flow
    return
  }
}
