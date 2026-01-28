export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-background/80">
      <div className="container max-w-screen-2xl py-8 flex items-center justify-between text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} NATURE Society</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  )
}

