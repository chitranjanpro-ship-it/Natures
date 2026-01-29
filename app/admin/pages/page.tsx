import prisma from "@/lib/db"
import Link from "next/link"
import { requireRole } from "@/lib/roles"

export default async function AdminPagesList() {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"], "manage_content")

  const pages = await prisma.pageContent.findMany({
    orderBy: { slug: "asc" }
  })

  // We'll just list what's in DB. If empty, user can create? Or we seed them?
  // Let's seed them via a button or just show "Not Created" state if we were fancy.
  // Ideally, we should seed them. For now, let's just list existing and provide a "Create" button if strictly needed,
  // but better to just list them.

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Content Management</h1>
      </div>

      <div className="rounded-md border">
        <div className="grid grid-cols-4 border-b bg-muted p-4 font-medium">
          <div className="col-span-1">Slug</div>
          <div className="col-span-2">Title</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {pages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No pages found. Run seed or create manually.
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="grid grid-cols-4 border-b p-4 items-center last:border-0 hover:bg-muted/50">
              <div className="col-span-1 font-mono text-sm">{page.slug}</div>
              <div className="col-span-2 font-medium">{page.title}</div>
              <div className="col-span-1 text-right">
                <Link 
                  href={`/admin/pages/${page.slug}`}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Quick Seed Button (Client Component needed for action, or just a form) */}
      <form action={async () => {
        "use server"
        const defaults = [
          { slug: "awareness", title: "Awareness Programs", content: "<p>Our awareness programs focus on...</p>" },
          { slug: "training", title: "Training Programs", content: "<p>We offer various training sessions...</p>" },
          { slug: "research", title: "Research Initiatives", content: "<p>Our research team is working on...</p>" },
        ]
        
        for (const p of defaults) {
          await prisma.pageContent.upsert({
            where: { slug: p.slug },
            update: {},
            create: p
          })
        }
        const { revalidatePath } = await import("next/cache")
        revalidatePath("/admin/pages")
      }} className="mt-8">
        <button className="text-sm text-muted-foreground hover:underline">
          Initialize Default Pages (Awareness, Training, Research)
        </button>
      </form>
    </div>
  )
}
