"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export function CredentialAlert() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (searchParams.get("newAccount") === "true") {
      setShow(true)
      // Clean up the URL so a refresh doesn't show it again
      router.replace("/dashboard")
    }
  }, [searchParams, router])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-background border rounded-lg shadow-lg max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-semibold mb-2">Welcome to NATURE Society</h3>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Your account has been created successfully.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
             <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
               Please save your credentials (email & password) now.
             </p>
             <p className="text-xs text-muted-foreground mt-1">
               Your browser may have prompted you to save them. If not, please ensure you remember them for future access.
             </p>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button 
            onClick={() => setShow(false)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
