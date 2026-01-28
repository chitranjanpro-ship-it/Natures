"use client"

import { useState } from "react"
import { submitEnrollment, submitBulkEnrollment } from "./actions"
import { useFormStatus } from "react-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Domain = {
  id: string
  title: string
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? "Processing..." : text}
    </button>
  )
}

export function EnrolForm({ domains }: { domains: Domain[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single")

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setMode("single")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            mode === "single" 
              ? "border-b-2 border-emerald-600 text-emerald-600" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Single Entry
        </button>
        <button
          onClick={() => setMode("bulk")}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${
            mode === "bulk" 
              ? "border-b-2 border-emerald-600 text-emerald-600" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Bulk Upload
        </button>
      </div>

      {mode === "single" ? (
        <Card>
          <CardHeader>
            <CardTitle>Individual Enrollment</CardTitle>
            <CardDescription>Add a single student to a specific batch/vertical.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitEnrollment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <input name="name" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="Student Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input name="email" type="email" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="student@example.com" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input name="phone" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="+91..." />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <input name="course" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="e.g. B.Tech CS" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain</label>
                  <select name="domainId" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm">
                    <option value="">Select Domain</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch / Vertical</label>
                  <input name="batch" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="e.g. Batch 2024, Winter Cohort" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <select name="duration" className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm">
                  <option value="1 Month">1 Month</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                </select>
              </div>

              <SubmitButton text="Enrol Student" />
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Enrollment</CardTitle>
            <CardDescription>Upload multiple students at once. Format: Name, Email, Phone, Course, Duration</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={submitBulkEnrollment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain (for all)</label>
                  <select name="domainId" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm">
                    <option value="">Select Domain</option>
                    {domains.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Batch / Vertical (for all)</label>
                  <input name="batch" required className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm" placeholder="e.g. Batch 2024" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Student Data (CSV Format)</label>
                <div className="text-xs text-muted-foreground mb-1">
                  Enter each student on a new line: Name, Email, Phone, Course, Duration
                </div>
                <textarea 
                  name="bulkData" 
                  rows={10} 
                  required
                  className="flex w-full rounded-md border border-input px-3 py-2 text-sm font-mono"
                  placeholder={`John Doe, john@example.com, 9876543210, B.Tech, 2 Months
Jane Smith, jane@example.com, 9123456780, BCA, 3 Months`}
                />
              </div>

              <SubmitButton text="Process Bulk Enrollment" />
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
