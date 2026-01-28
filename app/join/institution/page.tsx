import prisma from "@/lib/db"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import Link from "next/link"

async function registerInstitution(formData: FormData) {
  "use server"

  const orgName = formData.get("orgName")?.toString().trim()
  const orgType = formData.get("orgType")?.toString().trim()
  const address = formData.get("address")?.toString().trim()
  const website = formData.get("website")?.toString().trim()
  
  const contactName = formData.get("contactName")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim()
  
  const email = formData.get("email")?.toString().trim()
  const password = formData.get("password")?.toString().trim()

  if (!orgName || !contactName || !email || !password || !orgType) {
    return { error: "Missing required fields" }
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    return { error: "Email already registered" }
  }

  const hashedPassword = await hash(password, 10)

  // Create User + Institution Profile
  // We need to find or create the "Institution" role if we want to use roles, 
  // but for now we rely on the existence of 'institutionProfile' to determine type.
  
  await prisma.user.create({
    data: {
      name: orgName, // User name is Org Name for simplicity
      email,
      password: hashedPassword,
      institutionProfile: {
        create: {
          organizationName: orgName,
          type: orgType,
          contactPerson: contactName,
          contactPhone: phone,
          address,
          website,
          status: "Pending" // Needs admin approval? Or allow immediate access?
        }
      }
    }
  })

  redirect("/login?registered=true")
}

export default function InstitutionJoinPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="font-bold text-xl">NATURE Society</Link>
        </div>
      </header>
      
      <main className="flex-1 container py-10 max-w-2xl">
        <div className="mb-8">
          <Link href="/join" className="text-sm text-muted-foreground hover:underline">← Back to Join Options</Link>
          <h1 className="text-3xl font-bold mt-4">Partner Registration</h1>
          <p className="text-muted-foreground mt-2">
            Register your School, College, Company, or NGO to manage internships directly.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form action={registerInstitution} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Organization Details</h3>
              
              <div className="grid gap-2">
                <label className="text-sm font-medium">Organization Name</label>
                <input name="orgName" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Acme Corp, City College" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Type</label>
                  <select name="orgType" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Type</option>
                    <option value="College">College / University</option>
                    <option value="School">School</option>
                    <option value="Company">Company / Corporate</option>
                    <option value="NGO">NGO / Non-Profit</option>
                    <option value="Government">Government Body</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Website (Optional)</label>
                  <input name="website" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="https://..." />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Address</label>
                <textarea name="address" rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Full address" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Contact Person (Internship Leader)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input name="contactName" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Name of coordinator" />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input name="phone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Direct contact number" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Account Login</h3>
              <p className="text-xs text-muted-foreground">You will use these credentials to log in and manage interns.</p>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <input name="email" type="email" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="coordinator@organization.com" />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Password</label>
                <input name="password" type="password" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Create a strong password" />
              </div>
            </div>

            <button type="submit" className="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-11 px-8 font-medium hover:bg-primary/90">
              Register Institution
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
