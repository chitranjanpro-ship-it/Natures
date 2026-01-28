import { auth, signOut } from "@/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"

async function doSignOut() {
  "use server"
  await signOut()
}

export default async function InstitutionDashboard() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { institutionProfile: true }
  })

  if (!user?.institutionProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow text-center">
          <h1 className="text-xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            This account is not registered as an institutional partner.
          </p>
          <Link href="/join/institution" className="text-primary hover:underline">
            Register your institution →
          </Link>
        </div>
      </div>
    )
  }

  const profile = user.institutionProfile

  const interns = await prisma.internshipApplication.findMany({
    where: { institutionId: profile.id },
    include: { domain: true },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container max-w-screen-xl h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-bold text-xl text-emerald-900">NATURE Society</Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-medium text-muted-foreground">Partner Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium flex items-center gap-2 justify-end">
                {profile.organizationName}
                {profile.status === 'Approved' && (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Verified
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{profile.contactPerson}</p>
            </div>
            <form action={doSignOut}>
              <button className="text-sm font-medium text-red-600 hover:underline">
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="container max-w-screen-xl py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground">Manage your institution's interns and applications.</p>
          </div>
          {profile.status === 'Approved' ? (
            <Link 
              href="/institution/enrol" 
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-medium shadow-sm transition-colors"
            >
              + Enrol Candidate
            </Link>
          ) : (
            <button 
              disabled
              className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-gray-300 text-gray-500 font-medium shadow-sm cursor-not-allowed"
            >
              + Enrol Candidate
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Total Enrolled</h3>
            <p className="text-3xl font-bold mt-2">{interns.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Active Interns</h3>
            <p className="text-3xl font-bold mt-2 text-emerald-600">
              {interns.filter(i => i.status === "Ongoing" || i.status === "Accepted").length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">Pending Approval</h3>
            <p className="text-3xl font-bold mt-2 text-amber-600">
              {interns.filter(i => i.status === "Pending").length}
            </p>
          </div>
        </div>

        {profile.status !== 'Approved' && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>
              <p className="font-semibold">Account Pending Approval</p>
              <p className="text-sm mt-1">Your institution profile is currently under review by the administrators. You cannot enroll new candidates until your account is approved.</p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="font-semibold">Internship Candidates</h2>
          </div>
          
          {interns.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No candidates enrolled yet. Click "Enrol Candidate" to start.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Domain</th>
                    <th className="px-6 py-3">Batch</th>
                    <th className="px-6 py-3">Duration</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date Enrolled</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {interns.map((intern) => (
                    <tr key={intern.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium">
                        <div>{intern.name}</div>
                        <div className="text-xs text-muted-foreground">{intern.email}</div>
                      </td>
                      <td className="px-6 py-3">{intern.domain?.title || "General"}</td>
                      <td className="px-6 py-3 text-xs">{intern.batch || "-"}</td>
                      <td className="px-6 py-3">{intern.duration || "-"}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${intern.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${intern.status === 'Ongoing' ? 'bg-green-100 text-green-800' : ''}
                          ${intern.status === 'Completed' ? 'bg-blue-100 text-blue-800' : ''}
                          ${intern.status === 'Rejected' || intern.status === 'Dropped' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {intern.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {new Date(intern.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3">
                        {intern.status === 'Completed' && (
                          <Link href={`/certificate/${intern.id}`} className="text-emerald-600 hover:underline font-medium" target="_blank">
                            View Certificate
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
