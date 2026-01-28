import Link from "next/link"

export function MainNav() {
  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <span className="hidden font-bold sm:inline-block">
          NATURE Society
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm font-medium">
        <Link
          href="/about"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          About
        </Link>
        <Link
          href="/contact"
          className="transition-colors hover:text-foreground/80 text-foreground/60"
        >
          Contact
        </Link>
      </nav>
    </div>
  )
}
