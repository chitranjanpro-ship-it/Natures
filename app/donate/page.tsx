import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"

async function createPublicDonation(formData: FormData) {
  "use server"

  const amountRaw = formData.get("amount")?.toString().trim()
  const donorNameRaw = formData.get("donorName")?.toString().trim()

  if (!amountRaw || !donorNameRaw) return

  const amount = Number(amountRaw)
  if (Number.isNaN(amount) || amount <= 0) return

  const receiptNo = `R-${Date.now()}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

  const createArgs: unknown = {
    data: {
      amount,
      donorName: donorNameRaw,
      donorEmail: formData.get("donorEmail")?.toString().trim() || null,
      purpose: formData.get("purpose")?.toString().trim() || null,
      date: formData.get("date")?.toString().trim()
        ? new Date(formData.get("date")!.toString().trim())
        : undefined,
      isAnonymous: formData.get("isAnonymous") === "on",
      receiptNo,
      mode: "Public",
      status: "Recorded",
    },
  }

  await prisma.donation.create(
    createArgs as Parameters<(typeof prisma.donation)["create"]>[0],
  )

  redirect("/donate?success=1")
}

export default async function DonatePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const latestDonations = await prisma.donation.findMany({
    orderBy: { date: "desc" },
    take: 5,
  })

  const success = searchParams?.success === "1"
  const cancel = searchParams?.cancel === "1"
  const gatewayConfigured = Boolean(process.env.STRIPE_SECRET_KEY)

  return (
    <ThemedPage pageKey="donate">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6 grid gap-10 md:grid-cols-[2fr,1fr]">
              <div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Donate</h1>
                <p className="text-muted-foreground max-w-2xl mb-6">
                  Your contribution supports our ongoing environmental awareness, training, and research
                  initiatives in urban and rural communities.
                </p>

                {success && (
                  <div className="mb-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
                    Thank you for your support. Your donation has been recorded.
                  </div>
                )}
                {cancel && (
                  <div className="mb-4 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-900 dark:text-red-100">
                    Your online payment was cancelled. You can try again or use offline options below.
                  </div>
                )}

                <div className="grid gap-6 max-w-lg">
                  <form action={createPublicDonation} className="grid gap-4">
                  <div className="grid gap-1 text-sm">
                    <label htmlFor="amount" className="font-medium">
                      Amount (₹)
                    </label>
                    <input
                      id="amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="100"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid gap-1 text-sm">
                    <label htmlFor="donorName" className="font-medium">
                      Your name
                    </label>
                    <input
                      id="donorName"
                      name="donorName"
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid gap-1 text-sm">
                    <label htmlFor="donorEmail" className="font-medium">
                      Email (for receipt)
                    </label>
                    <input
                      id="donorEmail"
                      name="donorEmail"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid gap-1 text-sm">
                    <label htmlFor="purpose" className="font-medium">
                      Purpose (optional)
                    </label>
                    <input
                      id="purpose"
                      name="purpose"
                      placeholder="Tree plantation, awareness camp, general fund..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <div className="grid gap-1 text-sm">
                    <label htmlFor="date" className="font-medium">
                      Date (optional)
                    </label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      className="h-4 w-4 rounded border border-input"
                    />
                    <span className="text-muted-foreground">Keep my name anonymous on public lists</span>
                  </label>

                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Record donation (offline / bank transfer)
                  </button>
                </form>

                {gatewayConfigured && (
                  <form
                    method="POST"
                    action="/api/payments/create-checkout-session"
                    className="grid gap-3 border-t border-border pt-4 text-sm"
                  >
                    <p className="text-xs text-muted-foreground">
                      Or use a card in Stripe test mode. This creates a pending donation and opens a secure
                      test checkout page.
                    </p>
                    <div className="grid gap-1 text-sm">
                      <label htmlFor="gateway-amount" className="font-medium">
                        Amount (₹)
                      </label>
                      <input
                        id="gateway-amount"
                        name="amount"
                        type="number"
                        min="1"
                        step="100"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-1 text-sm">
                      <label htmlFor="gateway-donorName" className="font-medium">
                        Your name
                      </label>
                      <input
                        id="gateway-donorName"
                        name="donorName"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-1 text-sm">
                      <label htmlFor="gateway-donorEmail" className="font-medium">
                        Email (for receipt)
                      </label>
                      <input
                        id="gateway-donorEmail"
                        name="donorEmail"
                        type="email"
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <div className="grid gap-1 text-sm">
                      <label htmlFor="gateway-purpose" className="font-medium">
                        Purpose (optional)
                      </label>
                      <input
                        id="gateway-purpose"
                        name="purpose"
                        placeholder="Tree plantation, awareness camp, general fund..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                    <button
                      type="submit"
                      className="mt-1 inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
                    >
                      Pay online (Stripe test mode)
                    </button>
                  </form>
                )}
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-lg border bg-card text-card-foreground p-6">
                  <h3 className="text-lg font-semibold">Recent support</h3>
                  {latestDonations.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Donations will appear here once people start contributing.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {latestDonations.map((d) => (
                        <li key={d.id} className="flex items-center justify-between">
                          <span className="truncate">
                            {d.isAnonymous ? "Anonymous" : d.donorName}
                            {d.purpose ? ` – ${d.purpose}` : ""}
                          </span>
                          <span className="font-medium">₹{d.amount.toFixed(0)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border bg-card text-card-foreground p-6 text-sm text-muted-foreground">
                  Offline donations are recorded in the internal dashboard so your finance team can
                  reconcile and issue receipts. When Stripe test keys are configured, supporters can
                  also contribute using the online payment form.
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
    </ThemedPage>
  )
}
