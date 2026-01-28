"use client"

import * as React from "react"
import Link from "next/link"
import { useState } from "react"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden mr-2">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
        aria-label="Toggle menu"
      >
        <span className="sr-only">Open main menu</span>
        {isOpen ? (
          <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-14 z-50 w-full bg-background border-b shadow-lg animate-in slide-in-from-top-5">
          <div className="container py-4 px-4 space-y-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
              About
            </Link>
            <Link href="/projects" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
              Projects
            </Link>
            <Link href="/join" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
              Join Us
            </Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="block text-sm font-medium hover:text-primary">
              Contact
            </Link>
            <Link href="/donate" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-primary font-bold">
              Donate
            </Link>
            <div className="border-t pt-4 mt-2">
               <Link href="/login" onClick={() => setIsOpen(false)} className="block text-sm font-medium text-muted-foreground">
                 Login
               </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
