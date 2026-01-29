"use client"

import { useState } from "react"
import { submitInternship, registerInstitutionFromInternship } from "./actions"
import { PasswordInput } from "@/components/ui/password-input"

interface Domain {
  id: string
  title: string
}

import { useFormStatus } from "react-dom"

function SubmitButton({ text = "Submit Application" }: { text?: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : text}
    </button>
  )
}

export function InternshipForm({ domains, success, isLoggedIn }: { domains: Domain[], success: boolean, isLoggedIn: boolean }) {
  const [applicantType, setApplicantType] = useState("Student")

  async function handlePartnerRegistration(formData: FormData) {
    const res = await registerInstitutionFromInternship(formData)
    if (res?.error) {
      alert(res.error)
    }
  }

  async function handleInternshipSubmit(formData: FormData) {
    await submitInternship(formData)
  }

  if (success) {
    return (
      <div className="bg-card border rounded-lg p-6 shadow-sm h-fit sticky top-24">
        <h2 className="text-2xl font-semibold mb-6">Apply Now</h2>
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-900 dark:text-emerald-100">
          <p className="font-medium">Application Submitted!</p>
          <p className="text-sm mt-1">Thank you for applying. We have sent a confirmation email to your registered address.</p>
          <p className="text-sm mt-2">You can track your application status on your <a href="/dashboard" className="underline font-semibold">Dashboard</a> (login required).</p>
          <a href="/internships" className="text-sm underline mt-4 inline-block">Submit another application</a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm h-fit sticky top-24">
      <h2 className="text-2xl font-semibold mb-6">
        {applicantType === "Partner" ? "Partner Registration" : "Apply Now"}
      </h2>
      
      <div className="grid gap-2 mb-6">
        <label className="text-sm font-medium">I am applying as</label>
        <select 
          value={applicantType}
          onChange={(e) => setApplicantType(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="Student">Student</option>
          <option value="Partner">Institution / Partner</option>
          <option value="Volunteer">Volunteer</option>
          <option value="Researcher">Researcher</option>
          <option value="Other">Other Entity</option>
        </select>
      </div>

      {applicantType === "Partner" ? (
        /* Partner Registration Form */
        <form action={handlePartnerRegistration} className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Organization Details</h3>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium">Organization Name</label>
              <input name="orgName" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. Acme Corp, City College" />
            </div>

            <div className="grid grid-cols-1 gap-4">
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
            <h3 className="font-semibold text-lg border-b pb-2">Contact Person</h3>
            
            <div className="grid grid-cols-1 gap-4">
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
              <PasswordInput name="password" required placeholder="Create a strong password" autoComplete="new-password" />
            </div>
          </div>

          <SubmitButton text="Register Institution" />
        </form>
      ) : (
        /* Student / Volunteer / Other Form */
        <form action={handleInternshipSubmit} className="grid gap-4">
          <input type="hidden" name="applicantType" value={applicantType} />
          
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Domain</label>
            <select 
              name="domainId" 
              required 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue=""
            >
              <option value="" disabled>Choose a domain...</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>{domain.title}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              name="name"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="john@example.com"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                name="phone"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Institution</label>
            <input
              name="institution"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="University / College Name"
            />
          </div>

          {!isLoggedIn && (
            <div className="grid gap-2">
              <label className="text-sm font-medium">Create Password</label>
              <PasswordInput
                name="password"
                required
                placeholder="For your dashboard login"
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">We&apos;ll create an account so you can track your internship.</p>
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Internship Letter / Recommendation</label>
            <input
              name="letter"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">Upload your letter from school/college/university (PDF, Image).</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Current Course / Qualification</label>
              <select
                name="course"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>Select Course</option>
                <optgroup label="Schooling">
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </optgroup>
                <optgroup label="Undergraduate">
                  <option value="Diploma">Diploma</option>
                  <option value="B.A.">B.A.</option>
                  <option value="B.Sc.">B.Sc.</option>
                  <option value="B.Com.">B.Com.</option>
                  <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                  <option value="BBA">BBA</option>
                  <option value="BCA">BCA</option>
                  <option value="MBBS / BDS">MBBS / BDS</option>
                  <option value="LLB">LLB</option>
                  <option value="Other UG">Other UG</option>
                </optgroup>
                <optgroup label="Postgraduate">
                  <option value="M.A.">M.A.</option>
                  <option value="M.Sc.">M.Sc.</option>
                  <option value="M.Com.">M.Com.</option>
                  <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                  <option value="LLM">LLM</option>
                  <option value="Other PG">Other PG</option>
                </optgroup>
                <option value="PhD / Research">PhD / Research</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Duration</label>
              <select
                name="duration"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                defaultValue=""
              >
                <option value="" disabled>Select Duration</option>
                {[1, 2, 3, 4, 5, 6].map(m => (
                  <option key={m} value={`${m} Month${m > 1 ? 's' : ''}`}>{m} Month{m > 1 ? 's' : ''}</option>
                ))}
                <option value="More than 6 Months">More than 6 Months</option>
              </select>
            </div>
          </div>
          
          <SubmitButton />
        </form>
      )}
    </div>
  )
}
