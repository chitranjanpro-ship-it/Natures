import prisma from "@/lib/db"
import { requireRole } from "@/lib/roles"

type AuditLogRow = {
  id: string
  createdAt: string
  route: string
  method: string
  status: number
  ip: string | null
  details: string | null
  userId: string | null
  user: { email: string | null; name: string | null } | null
}

export default async function AuditLogPage() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "view_audit_log")

  const logs = (await (prisma as unknown as {
    auditLog: {
      findMany: (args: unknown) => Promise<unknown>
    }
  }).auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  })) as unknown as AuditLogRow[]

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Audit Log</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Recent security-relevant events across signups, payments, admin actions, and data exports.
      </p>

      <section className="rounded-lg border bg-white/80 dark:bg-black/40 backdrop-blur-md p-4 text-card-foreground">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries recorded yet.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border text-[11px] text-muted-foreground">
                  <th className="px-2 py-2 font-normal">Time</th>
                  <th className="px-2 py-2 font-normal">User</th>
                  <th className="px-2 py-2 font-normal">Route</th>
                  <th className="px-2 py-2 font-normal">Method</th>
                  <th className="px-2 py-2 font-normal">Status</th>
                  <th className="px-2 py-2 font-normal">IP</th>
                  <th className="px-2 py-2 font-normal">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: AuditLogRow) => (
                  <tr key={log.id} className="border-b border-border last:border-b-0">
                    <td className="px-2 py-2 align-top">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                    <td className="px-2 py-2 align-top">
                      {log.user?.email || log.user?.name || log.userId || "-"}
                    </td>
                    <td className="px-2 py-2 align-top">{log.route}</td>
                    <td className="px-2 py-2 align-top">{log.method}</td>
                    <td className="px-2 py-2 align-top">
                      <span className="rounded-md border border-input px-2 py-0.5 text-[11px]">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 align-top">{log.ip || "-"}</td>
                    <td className="px-2 py-2 align-top max-w-xs truncate" title={log.details || ""}>
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
