import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/roles"
import { logAudit } from "@/lib/audit"

async function createDonation(formData: FormData) {
  "use server"

  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_donations")

  const amountRaw = formData.get("amount")?.toString().trim()
  const donorNameRaw = formData.get("donorName")?.toString().trim()
  const donorEmailRaw = formData.get("donorEmail")?.toString().trim()
  const purposeRaw = formData.get("purpose")?.toString().trim()
  const dateRaw = formData.get("date")?.toString().trim()
  const isAnonymous = formData.get("isAnonymous") === "on"

  if (!amountRaw || !donorNameRaw) return

  const amount = Number(amountRaw)
  if (Number.isNaN(amount) || amount <= 0) return

  let date: Date | undefined
  if (dateRaw) {
    const d = new Date(dateRaw)
    if (!Number.isNaN(d.getTime())) {
      date = d
    }
  }

  const receiptNo = `R-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  const createArgs: unknown = {
    data: {
      amount,
      donorName: donorNameRaw,
      donorEmail: donorEmailRaw || null,
      purpose: purposeRaw || null,
      date,
      isAnonymous,
      receiptNo,
      mode: "Admin",
      status: "Recorded",
    },
  }

  await prisma.donation.create(
    createArgs as Parameters<(typeof prisma.donation)["create"]>[0],
  )

  await logAudit({
    userId: null,
    route: "/admin/donations",
    method: "POST",
    status: 201,
    ip: null,
    details: "create",
  })

  revalidatePath("/admin/donations")
}

async function updateDonationPayment(formData: FormData) {
  "use server"

  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_donations")

  const id = formData.get("id")?.toString().trim() ?? ""
  const status = formData.get("status")?.toString().trim() ?? ""
  const referenceRaw = formData.get("reference")?.toString().trim()

  if (!id || !status) return

  const updateArgs: unknown = {
    where: { id },
    data: {
      status,
      reference: referenceRaw || null,
    },
  }

  await prisma.donation.update(
    updateArgs as Parameters<(typeof prisma.donation)["update"]>[0],
  )

  await logAudit({
    userId: null,
    route: "/admin/donations",
    method: "POST",
    status: 200,
    ip: null,
    details: "update-status",
  })

  revalidatePath("/admin/donations")
}

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_donations")

  const gatewayConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

  const rawStatusFilter = searchParams?.status
  const statusFilter = typeof rawStatusFilter === "string" && rawStatusFilter.length > 0 ? rawStatusFilter : "all"

   const rawQ = searchParams?.q
   const q = typeof rawQ === "string" ? rawQ.trim() : ""

   const rawPage = searchParams?.page
   const pageNumber = typeof rawPage === "string" ? Number(rawPage) : 1
   const page = Number.isNaN(pageNumber) || pageNumber < 1 ? 1 : pageNumber
   const pageSize = 20

   const where =
     statusFilter !== "all" || q
       ? {
           ...(statusFilter !== "all" ? { status: statusFilter } : {}),
           ...(q
             ? {
                 OR: [
                   { donorName: { contains: q, mode: "insensitive" } },
                   { donorEmail: { contains: q, mode: "insensitive" } },
                   { purpose: { contains: q, mode: "insensitive" } },
                   { receiptNo: { contains: q, mode: "insensitive" } },
                 ],
               }
             : {}),
         }
       : undefined

  const [donations, totals, filteredCount] = await Promise.all([
    prisma.donation.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.donation.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.donation.count({ where }),
  ])

  const totalAmount = totals._sum.amount ?? 0
  const totalCount = totals._count
  const totalFiltered = filteredCount
  const totalPages = totalFiltered === 0 ? 1 : Math.max(1, Math.ceil(totalFiltered / pageSize))

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Donations & Finance</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manual recording and overview of donations. Payment gateway integration and multi-approval workflows can build on this.
      </p>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground">Total donations</p>
          <p className="mt-2 text-2xl font-semibold">₹{totalAmount.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground">Donation count</p>
          <p className="mt-2 text-2xl font-semibold">{totalCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground">
          <p className="text-xs text-muted-foreground">Gateway status</p>
          <p className="mt-2 text-sm">
            {gatewayConfigured ? "Stripe checkout enabled" : "Not configured"}
          </p>
        </div>
      </section>

      <section className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form className="flex flex-wrap items-center gap-2" method="get">
          <span className="text-muted-foreground">Filter</span>
          <select
            name="status"
            defaultValue={statusFilter}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All statuses</option>
            <option value="Recorded">Recorded</option>
            <option value="Pending">Pending</option>
            <option value="Received">Received</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email, purpose, receipt"
            className="h-8 w-44 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:w-64"
          />
          <input type="hidden" name="page" value="1" />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Apply
          </button>
        </form>
        <a
          href="/admin/donations/export"
          className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Download CSV
        </a>
      </section>

      <section className="mb-10 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="mb-4 text-lg font-semibold">Record offline donation</h2>
        <form action={createDonation} className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Amount (₹)</span>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Donor name</span>
            <input
              name="donorName"
              placeholder="Name or organisation"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Donor email</span>
            <input
              name="donorEmail"
              type="email"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs md:col-span-2">
            <span className="text-muted-foreground">Purpose</span>
            <input
              name="purpose"
              placeholder="General fund, project-specific, etc."
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Date</span>
            <input
              name="date"
              type="date"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2 text-xs md:col-span-2">
            <input
              type="checkbox"
              name="isAnonymous"
              className="h-4 w-4 rounded border border-input"
            />
            <span className="text-muted-foreground">Mark as anonymous in reports</span>
          </div>
          <div className="flex items-end justify-end md:col-span-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save donation
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent donations</h2>
        {donations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No donations match the current filters.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Receipt</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Donor</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Amount</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Purpose</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Mode</th>
                  <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground">Status / Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {(donations as unknown as {
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
                }[]).map((d) => (
                  <tr key={d.id}>
                    <td className="px-3 py-2 align-top">
                      {new Date(d.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-3 py-2 align-top font-mono text-xs">{d.receiptNo}</td>
                    <td className="px-3 py-2 align-top">
                      {d.isAnonymous ? "Anonymous" : d.donorName}
                      {d.donorEmail && (
                        <span className="block text-[11px] text-muted-foreground">{d.donorEmail}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 align-top">₹{d.amount.toFixed(2)}</td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground">{d.purpose ?? "—"}</td>
                    <td className="px-3 py-2 align-top text-xs text-muted-foreground">{d.mode}</td>
                    <td className="px-3 py-2 align-top">
                      <form action={updateDonationPayment} className="flex flex-col gap-1 text-[11px]">
                        <input type="hidden" name="id" value={d.id} />
                        <select
                          name="status"
                          defaultValue={d.status}
                          className="h-7 rounded-md border border-input bg-background px-1 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="Recorded">Recorded</option>
                          <option value="Pending">Pending</option>
                          <option value="Received">Received</option>
                          <option value="Failed">Failed</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <input
                            name="reference"
                            defaultValue={d.reference ?? ""}
                            placeholder="Ref / Txn ID"
                            className="flex h-7 w-full rounded-md border border-input bg-background px-1 text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          />
                          <button
                            type="submit"
                            className="whitespace-nowrap rounded-md border border-input px-2 py-0.5 text-[11px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between border-t border-border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
              <div>
                Page {page} of {totalPages} • Showing {donations.length} of {totalFiltered} donations
              </div>
              <div className="flex gap-2">
                <form method="get" className="inline-flex">
                  <input type="hidden" name="status" value={statusFilter} />
                  {q && <input type="hidden" name="q" value={q} />}
                  <input type="hidden" name="page" value={page - 1} />
                  <button
                    type="submit"
                    disabled={page <= 1}
                    className="inline-flex items-center justify-center rounded-md border border-input px-2 py-1 text-[11px] disabled:opacity-50"
                  >
                    Previous
                  </button>
                </form>
                <form method="get" className="inline-flex">
                  <input type="hidden" name="status" value={statusFilter} />
                  {q && <input type="hidden" name="q" value={q} />}
                  <input type="hidden" name="page" value={page + 1} />
                  <button
                    type="submit"
                    disabled={page >= totalPages}
                    className="inline-flex items-center justify-center rounded-md border border-input px-2 py-1 text-[11px] disabled:opacity-50"
                  >
                    Next
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
