import { auth } from "@/auth"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { EnrolForm } from "./enrol-form"

export default async function EnrolPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { institutionProfile: true }
  })

  if (!user?.institutionProfile) redirect("/join/institution")

  if (user.institutionProfile.status !== 'Approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow text-center">
          <h1 className="text-xl font-bold text-amber-600 mb-2">Account Pending Approval</h1>
          <p className="text-muted-foreground mb-4">
            Your institution profile is currently under review. You cannot enroll candidates until your account is approved by an administrator.
          </p>
          <Link href="/institution/dashboard" className="text-primary hover:underline">
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const domains = await prisma.internshipDomain.findMany({
    where: { isActive: true },
    orderBy: { title: "asc" }
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="container max-w-screen-xl h-16 flex items-center px-4">
          <Link href="/institution/dashboard" className="font-bold text-xl text-emerald-900 flex items-center gap-2">
            <span>←</span> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container max-w-2xl py-10 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Enrol Candidates</h1>
          <p className="text-muted-foreground">
            Manage your student enrollments for {user.institutionProfile.organizationName}.
          </p>
        </div>

        <EnrolForm domains={domains} />
      </main>
    </div>
  )
}
