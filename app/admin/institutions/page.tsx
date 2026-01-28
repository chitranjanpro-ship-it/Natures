
import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/roles"
import { sendWelcomeEmail } from "@/lib/email"

async function updateInstitutionStatus(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_institutions")

  const id = formData.get("id")?.toString()
  const status = formData.get("status")?.toString() // "Approved" or "Rejected"

  if (!id || !status) return

  const institution = await prisma.institutionProfile.update({
    where: { id },
    data: { status },
    include: { user: true }
  })

  if (status === "Approved" && institution.user.email) {
      // Fire and forget email (don't block the UI)
      sendWelcomeEmail(institution.user.email, institution.organizationName).catch(console.error)
  }

  revalidatePath("/admin/institutions")
}

export default async function AdminInstitutionsPage() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_institutions")

  const institutions = await prisma.institutionProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        user: { select: { email: true } }
    }
  })

  return (
    <div className="container py-10 max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-6">Partner Institutions</h1>

      <div className="grid gap-6">
        {institutions.length === 0 ? (
          <p className="text-muted-foreground">No institutional partners found.</p>
        ) : (
          institutions.map(inst => (
            <div key={inst.id} className="bg-card border rounded-lg p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold">{inst.organizationName}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border
                        ${inst.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                        ${inst.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
                        ${inst.status === 'Rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                    `}>
                        {inst.status}
                    </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                    <p>Type: {inst.type}</p>
                    <p>Contact: {inst.contactPerson} ({inst.contactPhone || "No phone"})</p>
                    <p>Email: {inst.user.email}</p>
                    <p>Website: {inst.website || "N/A"}</p>
                    <p>Address: {inst.address || "N/A"}</p>
                    <p>Registered: {new Date(inst.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {inst.status === "Pending" && (
                    <>
                        <form action={updateInstitutionStatus}>
                            <input type="hidden" name="id" value={inst.id} />
                            <input type="hidden" name="status" value="Approved" />
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Approve
                            </button>
                        </form>
                        <form action={updateInstitutionStatus}>
                            <input type="hidden" name="id" value={inst.id} />
                            <input type="hidden" name="status" value="Rejected" />
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                Reject
                            </button>
                        </form>
                    </>
                )}
                {inst.status === "Approved" && (
                     <form action={updateInstitutionStatus}>
                        <input type="hidden" name="id" value={inst.id} />
                        <input type="hidden" name="status" value="Rejected" />
                        <button className="border border-red-200 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium">
                            Revoke Access
                        </button>
                    </form>
                )}
                 {inst.status === "Rejected" && (
                     <form action={updateInstitutionStatus}>
                        <input type="hidden" name="id" value={inst.id} />
                        <input type="hidden" name="status" value="Approved" />
                        <button className="border border-emerald-200 text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-md text-sm font-medium">
                            Re-Approve
                        </button>
                    </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
