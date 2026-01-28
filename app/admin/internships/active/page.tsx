
import { revalidatePath } from "next/cache"
import prisma from "@/lib/db"
import { requireRole } from "@/lib/roles"

// --- Actions ---

async function markAttendance(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")

  const applicationId = formData.get("applicationId")?.toString()
  const dateStr = formData.get("date")?.toString()
  const status = formData.get("status")?.toString() // Present, Absent

  if (!applicationId || !dateStr || !status) return

  const date = new Date(dateStr)

  // Check if attendance already exists
  const existing = await prisma.internshipAttendance.findFirst({
    where: { applicationId, date }
  })

  if (existing) {
    await prisma.internshipAttendance.update({
      where: { id: existing.id },
      data: { status }
    })
  } else {
    await prisma.internshipAttendance.create({
      data: { applicationId, date, status }
    })
  }

  revalidatePath("/admin/internships/active")
}

async function createAssignment(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")

  const applicationId = formData.get("applicationId")?.toString()
  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const dueDateStr = formData.get("dueDate")?.toString()

  if (!applicationId || !title || !description) return

  await prisma.internshipAssignment.create({
    data: {
      applicationId,
      title,
      description,
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      status: "Assigned"
    }
  })

  revalidatePath("/admin/internships/active")
}

async function updateStatus(formData: FormData) {
  "use server"
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")

  const id = formData.get("id")?.toString()
  const status = formData.get("status")?.toString()

  if (!id || !status) return

  await prisma.internshipApplication.update({
    where: { id },
    data: { status }
  })

  revalidatePath("/admin/internships/active")
}

// --- Page Component ---

export default async function ActiveInternshipsPage() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_internships")

  const activeInterns = await prisma.internshipApplication.findMany({
    where: {
      status: { in: ["Ongoing", "Accepted", "Completed"] }
    },
    include: {
      domain: true,
      attendances: {
        orderBy: { date: "desc" },
        take: 5
      },
      assignments: {
        orderBy: { issuedDate: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="container py-10 max-w-screen-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Internship Program Management</h1>
          <p className="text-muted-foreground mt-1">
            Oversee active interns, track progress, and manage program settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="/admin/applications" 
            className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-medium"
          >
            Review Applications
          </a>
          <a 
            href="/admin/internships/domains" 
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm font-medium"
          >
            Manage Domains
          </a>
        </div>
      </div>

      <div className="grid gap-8">
        {activeInterns.length === 0 ? (
          <p className="text-muted-foreground">No active interns found. Accept applications first.</p>
        ) : (
          activeInterns.map(intern => (
            <div key={intern.id} className="border rounded-lg bg-card p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {intern.name}
                    <span className="text-sm font-normal text-muted-foreground bg-secondary/10 px-2 py-0.5 rounded-full">
                      {intern.domain?.title || "No Domain"}
                    </span>
                  </h2>
                  <div className="text-sm text-muted-foreground mt-1">
                    {intern.email} • {intern.phone} • {intern.institution}
                  </div>
                  {/* Internship Letter Link */}
                  {/* @ts-ignore - letterUrl might not be typed yet if prisma client isn't fully regenerated in IDE */}
                  {intern.letterUrl && (
                    <div className="mt-1">
                      <a 
                        // @ts-ignore
                        href={intern.letterUrl} 
                        target="_blank" 
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                        View Internship Letter
                      </a>
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground mt-1">
                    Status: <span className="font-medium text-foreground">{intern.status}</span>
                  </div>
                  {intern.status === "Completed" && (
                    <div className="mt-2">
                      <a href={`/certificate/${intern.id}`} target="_blank" className="text-sm font-medium text-emerald-600 hover:underline flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        View Certificate
                      </a>
                    </div>
                  )}
                </div>
                
                <form action={updateStatus} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={intern.id} />
                  <select 
                    name="status" 
                    defaultValue={intern.status}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Incomplete">Incomplete</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                  <button type="submit" className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                    Update
                  </button>
                </form>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Attendance Section */}
                <div className="border rounded-md p-4">
                  <h3 className="font-semibold mb-3">Attendance</h3>
                  <form action={markAttendance} className="flex gap-2 mb-4">
                    <input type="hidden" name="applicationId" value={intern.id} />
                    <input 
                      type="date" 
                      name="date" 
                      defaultValue={today}
                      required
                      className="h-8 rounded-md border border-input px-2 text-sm"
                    />
                    <select name="status" className="h-8 rounded-md border border-input px-2 text-sm">
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Leave">Leave</option>
                    </select>
                    <button type="submit" className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent">
                      Mark
                    </button>
                  </form>
                  
                  <div className="space-y-2">
                    {intern.attendances.map(att => (
                      <div key={att.id} className="flex justify-between text-sm border-b pb-1 last:border-0">
                        <span>{new Date(att.date).toLocaleDateString()}</span>
                        <span className={att.status === "Present" ? "text-green-600" : "text-red-600"}>
                          {att.status}
                        </span>
                      </div>
                    ))}
                    {intern.attendances.length === 0 && <p className="text-xs text-muted-foreground">No attendance records.</p>}
                  </div>
                </div>

                {/* Assignment Section */}
                <div className="border rounded-md p-4">
                  <h3 className="font-semibold mb-3">Assignments</h3>
                  <form action={createAssignment} className="grid gap-2 mb-4">
                    <input type="hidden" name="applicationId" value={intern.id} />
                    <input 
                      name="title" 
                      placeholder="Assignment Title" 
                      required
                      className="h-8 rounded-md border border-input px-2 text-sm w-full"
                    />
                    <div className="flex gap-2">
                      <input 
                        name="description" 
                        placeholder="Description" 
                        required
                        className="h-8 rounded-md border border-input px-2 text-sm flex-1"
                      />
                      <input 
                        type="date" 
                        name="dueDate" 
                        className="h-8 rounded-md border border-input px-2 text-sm w-32"
                      />
                    </div>
                    <button type="submit" className="h-8 px-3 rounded-md border text-xs font-medium hover:bg-accent w-full">
                      Assign Task
                    </button>
                  </form>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {intern.assignments.map(ass => (
                      <div key={ass.id} className="border rounded p-2 text-sm">
                        <div className="font-medium">{ass.title}</div>
                        <div className="text-xs text-muted-foreground">{ass.description}</div>
                        <div className="flex justify-between mt-1 text-xs">
                          <span>Status: {ass.status}</span>
                          {ass.dueDate && <span>Due: {new Date(ass.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                    {intern.assignments.length === 0 && <p className="text-xs text-muted-foreground">No assignments yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
