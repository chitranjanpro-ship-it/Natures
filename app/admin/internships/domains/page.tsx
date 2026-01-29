
import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/roles"

async function createDomain(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")
  
  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  
  if (!title) return

  await prisma.internshipDomain.create({
    data: {
      title,
      description,
      isActive: true,
    }
  })
  
  revalidatePath("/admin/internships/domains")
}

async function toggleDomainStatus(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")
  
  const id = formData.get("id")?.toString()
  const isActive = formData.get("isActive") === "true"
  
  if (!id) return

  await prisma.internshipDomain.update({
    where: { id },
    data: { isActive: !isActive }
  })
  
  revalidatePath("/admin/internships/domains")
}

export default async function InternshipDomainsPage() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")
  
  const domains = await prisma.internshipDomain.findMany({
    orderBy: { title: "asc" }
  })

  return (
    <div className="container py-10 max-w-screen-lg">
      <h1 className="text-2xl font-bold mb-6">Internship Domains</h1>
      
      <div className="bg-card border rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Domain</h2>
        <form action={createDomain} className="flex gap-4 items-end">
          <div className="grid gap-2 flex-1">
            <label className="text-sm font-medium">Title</label>
            <input 
              name="title" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="e.g. Web Development"
            />
          </div>
          <div className="grid gap-2 flex-[2]">
            <label className="text-sm font-medium">Description</label>
            <input 
              name="description" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Brief description of the domain"
            />
          </div>
          <button 
            type="submit"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Add Domain
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {domains.map(domain => (
          <div key={domain.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{domain.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${domain.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {domain.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{domain.description || "No description"}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <form action={toggleDomainStatus}>
                <input type="hidden" name="id" value={domain.id} />
                <input type="hidden" name="isActive" value={domain.isActive.toString()} />
                <button 
                  type="submit"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  {domain.isActive ? "Disable" : "Enable"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {domains.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
            No internship domains created yet.
          </div>
        )}
      </div>
    </div>
  )
}
