import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/roles"
import { logAudit } from "@/lib/audit"
import { SubmitButton } from "@/components/submit-button"

async function saveProject(formData: FormData) {
  "use server"

  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_projects")

  const id = formData.get("id")?.toString()
  const title = formData.get("title")?.toString().trim() ?? ""
  const description = formData.get("description")?.toString().trim() ?? ""
  const status = formData.get("status")?.toString().trim() ?? ""
  const location = formData.get("location")?.toString().trim() || null
  const beneficiariesRaw = formData.get("beneficiaries")?.toString().trim()
  const budgetRaw = formData.get("budget")?.toString().trim()
  const startDateRaw = formData.get("startDate")?.toString().trim()
  const endDateRaw = formData.get("endDate")?.toString().trim()

  if (!title || !description || !status) return

  let beneficiaries: number | null = null
  if (beneficiariesRaw) {
    const parsed = Number(beneficiariesRaw)
    if (!Number.isNaN(parsed) && parsed >= 0) beneficiaries = Math.round(parsed)
  }

  let budget: number | null = null
  if (budgetRaw) {
    const parsed = Number(budgetRaw)
    if (!Number.isNaN(parsed) && parsed >= 0) budget = parsed
  }

  let startDate: Date | null = null
  if (startDateRaw) {
    const d = new Date(startDateRaw)
    if (!Number.isNaN(d.getTime())) startDate = d
  }

  let endDate: Date | null = null
  if (endDateRaw) {
    const d = new Date(endDateRaw)
    if (!Number.isNaN(d.getTime())) endDate = d
  }

  if (id) {
    await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        status,
        location,
        beneficiaries,
        budget,
        startDate,
        endDate,
      },
    })
  } else {
    await prisma.project.create({
      data: {
        title,
        description,
        status,
        location,
        beneficiaries,
        budget,
        startDate,
        endDate,
      },
    })
  }

  await logAudit({
    userId: null,
    route: "/admin/projects",
    method: "POST",
    status: 200, // 201 for create, 200 for update, simplifying
    ip: null,
    details: id ? "update" : "create",
  })

  redirect("/admin/projects")
}

async function deleteProject(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_projects")
  const id = formData.get("id")?.toString()
  if (!id) return

  await prisma.project.delete({ where: { id } })

  await logAudit({
    userId: null,
    route: "/admin/projects",
    method: "POST",
    status: 200,
    ip: null,
    details: "delete",
  })

  revalidatePath("/admin/projects")
}

async function duplicateProject(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_projects")
  const id = formData.get("id")?.toString()
  if (!id) return

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) return

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _projectId, ...data } = project

  await prisma.project.create({
    data: {
      ...data,
      title: `${data.title} (Copy)`,
      status: "On-hold", // Default to On-hold for copies
    },
  })

  await logAudit({
    userId: null,
    route: "/admin/projects",
    method: "POST",
    status: 201,
    ip: null,
    details: "duplicate",
  })

  revalidatePath("/admin/projects")
}

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_projects")

  const editId = typeof searchParams?.edit === "string" ? searchParams.edit : null

  const [projects, editProject] = await Promise.all([
    prisma.project.findMany({
      orderBy: { startDate: "desc" },
    }),
    editId ? prisma.project.findUnique({ where: { id: editId } }) : Promise.resolve(null),
  ])

  const statuses = ["Ongoing", "Completed", "Future", "On-hold"] as const

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Manage the official list of NATURE projects. These records power the public Projects page and dashboard views.
      </p>

      <section className="mb-10 rounded-lg border bg-card p-4 text-card-foreground" id="project-form">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{editProject ? "Edit project" : "Add new project"}</h2>
          {editProject && (
            <a href="/admin/projects" className="text-xs text-muted-foreground hover:underline">
              Cancel edit
            </a>
          )}
        </div>

        <form action={saveProject} className="grid gap-4 md:grid-cols-2">
          {editProject && <input type="hidden" name="id" value={editProject.id} />}

          <div className="flex flex-col gap-1 text-xs md:col-span-1">
            <span className="text-muted-foreground">Title</span>
            <input
              name="title"
              defaultValue={editProject?.title}
              placeholder="Rural Water Sanitation"
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex flex-col gap-1 text-xs md:col-span-1">
            <span className="text-muted-foreground">Status</span>
            <select
              name="status"
              defaultValue={editProject?.status || ""}
              required
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>Select status</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-xs md:col-span-2">
            <span className="text-muted-foreground">Description</span>
            <textarea
              name="description"
              defaultValue={editProject?.description}
              rows={3}
              required
              placeholder="Short description for the public site and reports."
              className="flex w-full rounded-md border border-input bg-background px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Location</span>
            <input
              name="location"
              defaultValue={editProject?.location || ""}
              placeholder="e.g. Village Name, District"
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Beneficiaries (approx.)</span>
            <input
              name="beneficiaries"
              type="number"
              min="0"
              defaultValue={editProject?.beneficiaries || ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Budget (approx.)</span>
            <input
              name="budget"
              type="number"
              min="0"
              step="0.01"
              defaultValue={editProject?.budget || ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">Start date</span>
            <input
              name="startDate"
              type="date"
              defaultValue={editProject?.startDate ? new Date(editProject.startDate).toISOString().split("T")[0] : ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <span className="text-muted-foreground">End date</span>
            <input
              name="endDate"
              type="date"
              defaultValue={editProject?.endDate ? new Date(editProject.endDate).toISOString().split("T")[0] : ""}
              className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-end justify-end md:col-span-2 gap-2">
            {editProject && (
              <a
                href="/admin/projects"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </a>
            )}
            <SubmitButton
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {editProject ? "Update project" : "Save project"}
            </SubmitButton>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Existing projects</h2>
        {projects.length === 0 && (
          <p className="text-sm text-muted-foreground">No projects yet. Add one above to populate the public site.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="flex flex-col justify-between rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold line-clamp-1" title={project.title}>{project.title}</h3>
                  <div className="flex items-center gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      project.status === "Ongoing" ? "bg-green-50 text-green-700 border-green-200" :
                      project.status === "Completed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      project.status === "Future" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      "bg-gray-50 text-gray-700 border-gray-200"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  {project.location && <span className="flex items-center gap-1">📍 {project.location}</span>}
                  {typeof project.budget === "number" && (
                    <span>💰 {project.budget.toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t pt-3">
                  <a
                    href={`/admin/projects?edit=${project.id}#project-form`}
                    className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-center text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    Edit
                  </a>

                  <form action={duplicateProject} className="flex-1">
                    <input type="hidden" name="id" value={project.id} />
                    <SubmitButton
                      pendingText="Copying..."
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-center text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      Copy
                    </SubmitButton>
                  </form>

                  <form action={deleteProject} className="flex-1">
                    <input type="hidden" name="id" value={project.id} />
                    <SubmitButton
                      pendingText="Deleting..."
                      className="w-full rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-center text-xs font-medium text-red-600 hover:bg-red-100 hover:text-red-700"
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
