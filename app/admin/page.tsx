import Link from "next/link"
import prisma from "@/lib/db"
import { requireAnyAdminAccess } from "@/lib/roles"
import { ThemeSwitcher } from "@/components/admin/theme-switcher"
import { ThemeDebugger } from "@/components/admin/theme-debugger"
import { getPageBackground } from "@/lib/backgrounds"

export default async function AdminDashboardPage() {
  const { role, session } = await requireAnyAdminAccess()
  const userId = session?.user?.id
  
  const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: { include: { permissions: true } } }
  })
  
  const permissions = userRecord?.role?.permissions.map(p => p.action) || []

  const checkAccess = (allowedRoles: string[], permission: string) => {
    if (role && allowedRoles.includes(role)) return true
    if (permissions.includes(permission)) return true
    return false
  }

  const [projectCount, donationCount] = await Promise.all([
    prisma.project.count(),
    prisma.donation.count(),
  ])

  const layoutBackground = await getPageBackground("layout")

  return (
    <main className="container max-w-screen-xl py-10">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Quick links to manage site content, themes, and data.
      </p>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Projects</p>
          <p className="mt-2 text-2xl font-semibold">{projectCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Donations</p>
          <p className="mt-2 text-2xl font-semibold">{donationCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <p className="text-xs text-muted-foreground">Background themes</p>
          <p className="mt-2 text-2xl font-semibold">All pages</p>
        </div>
      </section>

      {/* Theme Engine Section */}
      <section id="theme-engine" className="mb-8 scroll-mt-20 space-y-6">
        <ThemeSwitcher globalDefaultTheme={layoutBackground?.uiTheme || "nature"} />
        <ThemeDebugger />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {checkAccess(["Admin", "Manager"], "manage_backgrounds") && (
          <Link
            href="/admin/backgrounds"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Page Backgrounds</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure themes, gradients, and images for each page.
            </p>
          </Link>
        )}
        {checkAccess(["Admin", "Manager", "Reviewer"], "manage_projects") && (
          <Link
            href="/admin/projects"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Projects</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage the official list of projects shown on the site.
            </p>
          </Link>
        )}
        {checkAccess(["Admin", "Manager", "Reviewer", "SOCIETY_ADMIN", "SECRETARY"], "manage_applications") && (
          <Link
            href="/admin/applications"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Applications &amp; Inquiries</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Review member, volunteer, and contact submissions from the public site.
            </p>
          </Link>
        )}
        {checkAccess(["Admin", "Finance"], "manage_donations") && (
          <Link
            href="/admin/donations"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Donations &amp; Finance</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              View and record donations for financial tracking.
            </p>
          </Link>
        )}
        <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <Link href="/admin/internships/active" className="block group">
            <h2 className="text-lg font-semibold group-hover:underline">Internship Program</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage active interns, attendance, assignments, and domains.
            </p>
          </Link>
          <div className="mt-4 flex gap-2 text-xs text-primary underline">
            <Link href="/admin/internships/active" className="hover:text-primary/80">Active Interns</Link>
            <span>•</span>
            <Link href="/admin/internships/domains" className="hover:text-primary/80">Domains</Link>
          </div>
        </div>
        {checkAccess(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_institutions") && (
          <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
            <Link href="/admin/institutions" className="block group">
              <h2 className="text-lg font-semibold group-hover:underline">Partner Institutions</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Approve and manage institutional partners.
              </p>
            </Link>
          </div>
        )}
        {checkAccess(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "manage_users") && (
          <Link
            href="/admin/users"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Users &amp; Roles</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage which users can access admin, finance, and review features.
            </p>
          </Link>
        )}
        {checkAccess(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN"], "view_audit_log") && (
          <Link
            href="/admin/audit-log"
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <h2 className="text-lg font-semibold">Audit Log</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Review recent security and data access events.
            </p>
          </Link>
        )}
      </section>
    </main>
  )
}
