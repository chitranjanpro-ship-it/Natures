import prisma from "@/lib/db"
import { requireRole } from "@/lib/roles"
import { updateApplicationStatus } from "@/app/actions/applications"

type MembershipApplicationRow = {
  id: string
  name: string
  email: string
  membershipType: string
  createdAt: string
  status: string
}

type InternshipApplicationRow = {
  id: string
  name: string
  email: string
  phone: string | null
  institution: string
  course: string | null
  duration: string | null
  createdAt: string
  status: string
}

type VolunteerApplicationRow = {
  id: string
  name: string
  phone: string | null
  skills: string | null
  createdAt: string
  status: string
}

type ContactMessageRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  message: string
  createdAt: string
  status: string
}

export default async function AdminApplicationsPage() {
  await requireRole(["Admin", "Manager", "Reviewer", "SOCIETY_ADMIN", "SECRETARY"], "manage_applications")

  const [membershipApps, volunteerApps, internshipApps, contactMessages] = await Promise.all([
    (prisma as unknown as { membershipApplication: { findMany: (args: unknown) => Promise<unknown> } }).membershipApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as unknown as Promise<MembershipApplicationRow[]>,
    (prisma as unknown as { volunteerApplication: { findMany: (args: unknown) => Promise<unknown> } }).volunteerApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as unknown as Promise<VolunteerApplicationRow[]>,
    (prisma as unknown as { internshipApplication: { findMany: (args: unknown) => Promise<unknown> } }).internshipApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as unknown as Promise<InternshipApplicationRow[]>,
    (prisma as unknown as { contactMessage: { findMany: (args: unknown) => Promise<unknown> } }).contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }) as unknown as Promise<ContactMessageRow[]>,
  ])

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Applications &amp; Inquiries</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Review membership, volunteer, and contact submissions coming from the public website.
      </p>

      <section className="mb-6 flex items-center justify-end">
        <a
          href="/admin/applications/export"
          className="inline-flex items-center justify-center rounded-md border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Download CSV
        </a>
      </section>

      <section className="mb-10 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="mb-4 text-lg font-semibold">Membership applications</h2>
        {membershipApps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No membership applications yet.</p>
        ) : (
          <div className="space-y-3">
            {membershipApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {app.name}
                    <span className="ml-2 text-xs text-muted-foreground">({app.membershipType})</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {app.email} 
                    <span className="mx-1">•</span>
                    {new Date(app.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1">
                    <a href={`/admin/applications/membership/${app.id}`} className="text-xs text-primary hover:underline">
                      View Details & Messages
                    </a>
                  </div>
                </div>
                <form
                  action={updateApplicationStatus}
                  className="mt-1 flex items-center gap-2 text-xs md:mt-0"
                >
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="type" value="membership" />
                  <select
                    name="status"
                    defaultValue={app.status}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-input px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="mb-4 text-lg font-semibold">Volunteer applications</h2>
        {volunteerApps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No volunteer applications yet.</p>
        ) : (
          <div className="space-y-3">
            {volunteerApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="text-sm">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.phone && <span>{app.phone} <span className="mx-1">•</span></span>}
                    {new Date(app.createdAt).toLocaleString("en-IN")}
                  </div>
                  {app.skills && (
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{app.skills}</div>
                  )}
                  <div className="mt-1">
                    <a href={`/admin/applications/volunteer/${app.id}`} className="text-xs text-primary hover:underline">
                      View Details & Messages
                    </a>
                  </div>
                </div>
                <form
                  action={updateApplicationStatus}
                  className="mt-1 flex items-center gap-2 text-xs md:mt-0"
                >
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="type" value="volunteer" />
                  <select
                    name="status"
                    defaultValue={app.status}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Onboarded">Onboarded</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-input px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="mb-4 text-lg font-semibold">Internship applications</h2>
        {internshipApps.length === 0 ? (
          <p className="text-sm text-muted-foreground">No internship applications yet.</p>
        ) : (
          <div className="space-y-3">
            {internshipApps.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-center md:justify-between"
              >
                <div className="text-sm">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {app.email}
                    {app.phone && <span> • {app.phone}</span>}
                    <span className="mx-1">•</span>
                    {new Date(app.createdAt).toLocaleString("en-IN")}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                     {app.institution}
                     {app.course && <span> • {app.course}</span>}
                     {app.duration && <span> • {app.duration}</span>}
                  </div>
                  <div className="mt-1">
                    <a href={`/admin/applications/internship/${app.id}`} className="text-xs text-primary hover:underline">
                      View Details & Messages
                    </a>
                  </div>
                </div>
                <form
                  action={updateApplicationStatus}
                  className="mt-1 flex items-center gap-2 text-xs md:mt-0"
                >
                  <input type="hidden" name="id" value={app.id} />
                  <input type="hidden" name="type" value="internship" />
                  <select
                    name="status"
                    defaultValue={app.status}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-input px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-4 rounded-lg border bg-card p-4 text-card-foreground">
        <h2 className="mb-4 text-lg font-semibold">Contact messages</h2>
        {contactMessages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No contact messages yet.</p>
        ) : (
          <div className="space-y-3">
            {contactMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0 md:flex-row md:items-start md:justify-between"
              >
                <div className="text-sm">
                  <div className="font-medium">
                    {msg.firstName} {msg.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {msg.email}
                    <span className="mx-1">•</span>
                    {new Date(msg.createdAt).toLocaleString("en-IN")}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground whitespace-pre-line">{msg.message}</p>
                </div>
                <form
                  action={updateApplicationStatus}
                  className="mt-1 flex items-center gap-2 text-xs md:mt-0"
                >
                  <input type="hidden" name="id" value={msg.id} />
                  <input type="hidden" name="type" value="contact" />
                  <select
                    name="status"
                    defaultValue={msg.status}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="New">New</option>
                    <option value="In progress">In progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-md border border-input px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Update
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
