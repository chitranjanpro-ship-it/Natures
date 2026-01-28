
import { ThemedPage } from "../(themed)/themed-page-wrapper"
import prisma from "@/lib/db"
import { auth } from "@/auth"
import { InternshipForm } from "./internship-form"

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const domains = await prisma.internshipDomain.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" }
  })

  const success = searchParams?.success === "1"
  const session = await auth()

  return (
    <ThemedPage pageKey="join">
      <div className="container max-w-screen-xl py-12 md:py-24">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-6">Internship Program</h1>
              <p className="text-lg text-muted-foreground mb-4">
                Gain practical experience and make a real impact with NATURE Society. Our internship program 
                is designed for students who want to apply their knowledge in real-world scenarios.
              </p>
              
              <p className="text-sm text-muted-foreground mb-8">
                Represent an institution? <a href="/join/institution" className="text-primary hover:underline font-medium">Register as a Partner</a> to enroll candidates directly.
              </p>
              
              {!session && (
                 <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                   <strong>Tip:</strong> <a href="/login?callbackUrl=/internships" className="underline">Log in</a> before applying to track your internship progress, attendance, and certificates on your dashboard.
                 </div>
              )}
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Available Domains</h2>
              <div className="grid gap-4">
                {domains.length === 0 ? (
                  <p className="text-muted-foreground">No internship domains are currently open.</p>
                ) : (
                  domains.map(domain => (
                    <div key={domain.id} className="border rounded-lg p-4 bg-background">
                      <h3 className="font-semibold text-lg">{domain.title}</h3>
                      {domain.description && (
                        <p className="text-sm text-muted-foreground mt-1">{domain.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <InternshipForm domains={domains} success={success} isLoggedIn={!!session} />
        </div>
      </div>
    </ThemedPage>
  )
}
