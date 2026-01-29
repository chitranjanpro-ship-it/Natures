import { ThemedPage } from "../../(themed)/themed-page-wrapper"
import prisma from "@/lib/db"

export default async function VerifyCertificatePage({
  params,
}: {
  params: { id: string }
}) {
  const internship = await prisma.internshipApplication.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      course: true,
      institution: true,
      status: true,
      domain: {
        select: { title: true }
      },
      duration: true,
      completedAt: true
    }
  })

  if (!internship) {
    return (
      <ThemedPage pageKey="home">
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-red-100 p-6 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-700">Certificate Not Found</h1>
          <p className="mt-2 text-muted-foreground">The certificate ID you provided does not exist in our records.</p>
        </div>
      </ThemedPage>
    )
  }

  if (internship.status !== "Completed") {
    return (
      <ThemedPage pageKey="home">
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-full bg-yellow-100 p-6 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-yellow-700">Internship Not Completed</h1>
          <p className="mt-2 text-muted-foreground">This internship application exists but has not been marked as completed.</p>
        </div>
      </ThemedPage>
    )
  }

  return (
    <ThemedPage pageKey="home">
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12">
        <div className="max-w-md w-full bg-card border rounded-xl shadow-lg overflow-hidden">
          <div className="bg-emerald-600 p-6 text-center">
            <div className="mx-auto bg-white rounded-full p-3 w-16 h-16 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Valid Certificate</h1>
            <p className="text-emerald-100 text-sm">Issued by NATURE Society</p>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="text-center pb-4 border-b">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">Intern Name</p>
              <p className="text-xl font-semibold">{internship.name}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Domain</p>
                <p className="font-medium">{internship.domain?.title || "General"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Duration</p>
                <p className="font-medium">{internship.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Institution</p>
                <p className="font-medium">{internship.institution}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Completed On</p>
                <p className="font-medium">{internship.completedAt?.toLocaleDateString() || "N/A"}</p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-xs text-muted-foreground">Certificate ID: {internship.id}</p>
            </div>
          </div>
        </div>
      </div>
    </ThemedPage>
  )
}