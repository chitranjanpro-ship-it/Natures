import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UserDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const [internships, membership, volunteer, userRoleData, institutionProfile] = await Promise.all([
    prisma.internshipApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membershipApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.volunteerApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: { select: { name: true } } }
    }),
    prisma.institutionProfile.findUnique({
      where: { userId },
      include: { interns: true }
    })
  ]);

  const roleName = userRoleData?.role?.name || "";
  const isAdmin = ["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "Manager"].includes(roleName);
  const isPartner = !!institutionProfile;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-screen-xl py-10 px-4 md:px-6">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="bg-card p-4 rounded-xl border shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {session.user.name}</p>
          </div>
          <div className="flex gap-3">
            <form action={async () => {
              "use server";
              const { signOut } = await import("@/auth");
              await signOut();
            }}>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 shadow-sm">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Admin Access Control Section */}
          {isAdmin && (
            <div className="col-span-full mb-4">
              <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                <div className="bg-muted/50 p-4 border-b flex items-center justify-between">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    Access Control & Administration
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {roleName || "Admin"}
                    </span>
                  </div>
                </div>
                <div className="p-6 grid gap-4 md:grid-cols-3">
                  <Link href="/admin/users" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      </div>
                      <div className="font-semibold">User Management</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Manage roles, permissions, and user accounts.</p>
                  </Link>

                  <Link href="/admin/audit-log" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      </div>
                      <div className="font-semibold">Audit Logs</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">View system activity and security logs.</p>
                  </Link>

                  <Link href="/admin/pages" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      </div>
                      <div className="font-semibold">Content Management</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Edit static pages like Awareness, Training, etc.</p>
                  </Link>

                  <Link href="/admin" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      </div>
                      <div className="font-semibold">Full Admin Panel</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Access the complete administration dashboard.</p>
                  </Link>

                  <Link href="/admin/applications" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M9 15l3 3 3-3"/></svg>
                      </div>
                      <div className="font-semibold">Review Applications</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Review and accept pending applications.</p>
                  </Link>

                  <Link href="/admin#theme-engine" className="group flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.093 0-.679.63-1.216 1.318-1.216H16c3.3 0 6-2.7 6-6 0-3.313-2.687-6-6-6z"/></svg>
                      </div>
                      <div className="font-semibold">Theme Engine</div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Customize global site appearance.</p>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Partner / Institution Dashboard Section */}
          {isPartner && (
            <Card className="col-span-full border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
               <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-3">
                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.5a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5V21"/><path d="M9 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
                  Partner Institution Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                   <div>
                      <h3 className="font-semibold text-blue-900 mb-2">{institutionProfile.organizationName}</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Status: <span className="font-medium">{institutionProfile.status}</span>
                      </p>
                      <div className="flex gap-2">
                         <Link href="/dashboard/institution/edit" className="text-sm bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-50">
                            Edit Profile
                         </Link>
                         <Link href="/dashboard/institution/interns" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                            Manage Interns
                         </Link>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Quick Stats</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <span className="block text-2xl font-bold text-blue-700">{institutionProfile.interns?.length || 0}</span>
                            <span className="text-xs text-slate-500">Total Interns</span>
                         </div>
                         <div>
                            <span className="block text-2xl font-bold text-emerald-600">
                               {institutionProfile.interns?.filter(i => i.status === 'Completed').length || 0}
                            </span>
                            <span className="text-xs text-slate-500">Completed</span>
                         </div>
                      </div>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Cards (Internship, Membership, Volunteer) */}
          <Card className="bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="bg-muted/50 border-b pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10v6"/><path d="M20 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M10 22h4"/><path d="M12 10v12"/></svg>
                Internship Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {internships.length > 0 ? (
                <div className="space-y-4">
                  {internships.map((app) => (
                    <div key={app.id} className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border">
                      <div className="flex justify-between items-start">
                         <div className="font-medium">{app.domain}</div>
                         <div className={`text-xs px-2 py-0.5 rounded-full border ${
                            app.status === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' :
                            app.status === 'Accepted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            app.status === 'Ongoing' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                            app.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-700 border-yellow-200'
                         }`}>
                            {app.status}
                         </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Applied: {new Date(app.createdAt).toLocaleDateString()}</div>
                      <div className="mt-2 flex gap-2">
                        <Link href={`/dashboard/applications/internship/${app.id}`} className="text-xs underline text-primary">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">No internship applications yet.</p>
                  <Link href="/internships" className="text-xs text-primary underline mt-2 inline-block">
                    Apply for Internship
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="bg-muted/50 border-b pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Membership Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {membership ? (
                 <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-start mb-2">
                       <div className="font-medium">General Membership</div>
                       <div className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          {membership.status}
                       </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Joined: {new Date(membership.createdAt).toLocaleDateString()}</div>
                    <div className="mt-2">
                       <Link href={`/dashboard/applications/membership/${membership.id}`} className="text-xs underline text-primary">
                          View Membership Card
                       </Link>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Not a member yet.</p>
                  <Link href="/get-involved" className="text-xs text-primary underline mt-2 inline-block">
                    Join Membership
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="bg-muted/50 border-b pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                Volunteer Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {volunteer ? (
                 <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex justify-between items-start mb-2">
                       <div className="font-medium">Volunteer Profile</div>
                       <div className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                          {volunteer.status}
                       </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Since: {new Date(volunteer.createdAt).toLocaleDateString()}</div>
                    <div className="mt-2">
                       <Link href={`/dashboard/applications/volunteer/${volunteer.id}`} className="text-xs underline text-primary">
                          View Details
                       </Link>
                    </div>
                 </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">Not registered as volunteer.</p>
                  <Link href="/get-involved" className="text-xs text-primary underline mt-2 inline-block">
                    Join as Volunteer
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
