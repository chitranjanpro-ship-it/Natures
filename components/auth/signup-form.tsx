"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

type SignupFormProps = {
  error?: string
  success?: string
}

export function SignupForm({ error: initialError, success: initialSuccess }: SignupFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | undefined>(initialError)
  const [success, setSuccess] = useState<string | undefined>(initialSuccess)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(undefined)
    setSuccess(undefined)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData)

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.error === "Exists") {
          setError("User with this email already exists.")
        } else if (json.error === "Invalid") {
          setError("Invalid input data.")
        } else if (json.error === "Too many requests") {
            setError("Too many attempts. Please try again later.")
        } else {
          setError("Something went wrong. Please try again.")
        }
        return
      }

      setSuccess("Account created successfully! Redirecting to login...")
      
      // Redirect to login page after successful signup
      setTimeout(() => {
        router.push("/login?success=AccountCreated")
      }, 1500)

    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">Sign up to join NATURE Society</p>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="role">I am a...</Label>
            <select
              id="role"
              name="role"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              defaultValue="GENERAL_MEMBER"
            >
              <option value="GENERAL_MEMBER">Legal Member</option>
              <option value="VOLUNTEER">Volunteer</option>
              <option value="STUDENT">Student</option>
              <option value="RESEARCHER">Researcher</option>
              <option value="INSTITUTION">Institution / Partner</option>
            </select>
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="name">Name</Label>
            <Input 
              id="name" 
              name="name" 
              placeholder="Your name" 
              required
              autoComplete="name"
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="name@example.com" 
              required
              autoComplete="email"
            />
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">Password</Label>
            <PasswordInput 
              id="password" 
              name="password" 
              placeholder="Password" 
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
