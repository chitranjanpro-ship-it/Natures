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
    const args: unknown = {
      data: {
        userId: params.userId ?? null,
        route: params.route,
        method: params.method,
        status: params.status,
        ip: params.ip ?? null,
        details: params.details ?? null,
      },
    }

    await (prisma as unknown as {
      auditLog: { create: (args: unknown) => Promise<unknown> }
    }).auditLog.create(args)
  } catch {
    return
  }
}
