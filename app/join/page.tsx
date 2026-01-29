import Link from "next/link"
import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { ThemedPage } from "../(themed)/themed-page-wrapper"
import { auth } from "@/auth"


async function submitMembership(formData: FormData) {
  "use server"

  const name = formData.get("name")?.toString().trim()
  const email = formData.get("email")?.toString().trim()
  const membershipType = formData.get("membershipType")?.toString().trim()

  if (!name || !email || !membershipType) return

  await prisma.membershipApplication.create({
    data: {
      name,
      email,
      membershipType,
    },
  })

  redirect("/join?membership=1")
}

async function submitVolunteer(formData: FormData) {
  "use server"

  const name = formData.get("name")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim() || null
  const skills = formData.get("skills")?.toString().trim() || null

  if (!name) return

  const session = await auth()
  const userId = session?.user?.id

  await prisma.volunteerApplication.create({
    data: {
      name,
      phone,
      skills,
      userId,
    },
  })

  redirect("/join?volunteer=1")
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const membershipSuccess = searchParams?.membership === "1"
  const volunteerSuccess = searchParams?.volunteer === "1"
  // const internshipSuccess = searchParams?.internship === "1"

  return (
    <ThemedPage pageKey="join">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-8">Join NATURE Society</h1>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex flex-col gap-6">
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">Become a Member</h3>
                      <p className="text-muted-foreground mb-6">
                        Join us as a Patron, Life, or Ordinary member. Participate in our General Body Meetings and
                        help shape our policies.
                      </p>
                      <ul className="list-disc pl-5 mb-6 text-sm text-muted-foreground space-y-2">
                        <li>Voting rights in GBM</li>
                        <li>Access to financial reports</li>
                        <li>Networking opportunities</li>
                      </ul>
                    </div>
                    <div>
                      {membershipSuccess && (
                        <div className="mb-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-100">
                          Membership application submitted. The team will review and contact you.
                        </div>
                      )}
                      <form action={submitMembership} className="grid gap-3 text-sm">
                        <input
                          name="name"
                          placeholder="Full name"
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <input
                          name="email"
                          type="email"
                          placeholder="Email"
                          required
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <select
                          name="membershipType"
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          defaultValue=""
                          required
                        >
                          <option value="" disabled>
                            Select membership type
                          </option>
                          <option value="Patron">Patron</option>
                          <option value="Life">Life</option>
                          <option value="Ordinary">Ordinary</option>
                        </select>
                        <button
                          type="submit"
                          className="mt-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                        >
                          Apply for Membership
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <h3 className="text-2xl font-semibold mb-4">Volunteer With Us</h3>
                  <p className="text-muted-foreground mb-6">
                    Contribute your time and skills. We need volunteers for teaching, field work, event
                    management, and technical support.
                  </p>
                  <ul className="list-disc pl-5 mb-6 text-sm text-muted-foreground space-y-2">
                    <li>Certificate of appreciation</li>
                    <li>Skill development workshops</li>
                    <li>Direct community impact</li>
                  </ul>
                  {volunteerSuccess && (
                    <div className="mb-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-900 dark:text-emerald-100">
                      Volunteer registration submitted. The team will reach out to you.
                    </div>
                  )}
                  <form action={submitVolunteer} className="grid gap-3 text-sm">
                    <input
                      name="name"
                      placeholder="Full name"
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <input
                      name="phone"
                      placeholder="Phone"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <textarea
                      name="skills"
                      placeholder="Skills or areas where you want to help"
                      rows={3}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 w-full"
                  >
                    Register as Volunteer
                    </button>
                  </form>
                </div>

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                  <h3 className="text-2xl font-semibold mb-4">Apply for Internship</h3>
                  <p className="text-muted-foreground mb-6">
                    Join our structured internship program to gain real-world experience. Open for individual students and institutional partners.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                      <div className="mt-0.5 h-5 w-5 text-emerald-600 flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">For Students</p>
                        <p className="text-xs text-muted-foreground">Certification, Mentorship, Projects</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                       <div className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/><path d="M17 21v-8.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0-.5.5V21"/></svg>
                       </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">For Institutions</p>
                        <p className="text-xs text-muted-foreground">Bulk Enrollment, Progress Tracking</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Link 
                      href="/internships" 
                      className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full"
                    >
                      Apply as Student
                    </Link>
                    <Link 
                      href="/join/institution" 
                      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full"
                    >
                      Register as Partner
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ThemedPage>
  )
}
