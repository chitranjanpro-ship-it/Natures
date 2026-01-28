import prisma from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { requireRole } from "@/lib/roles"
import { revalidatePath } from "next/cache"

export default async function AdminEditPage({ params }: { params: { slug: string } }) {
  await requireRole(["Admin", "SYSTEM_ADMIN", "SUPER_ADMIN", "SOCIETY_ADMIN", "SECRETARY", "PRESIDENT"], "manage_content")

  const page = await prisma.pageContent.findUnique({
    where: { slug: params.slug }
  })

  if (!page) notFound()

  async function updatePage(formData: FormData) {
    "use server"
    const title = formData.get("title")?.toString()
    const content = formData.get("content")?.toString()

    if (!title || !content) return

    await prisma.pageContent.update({
      where: { slug: params.slug },
      data: { title, content }
    })

    revalidatePath(`/admin/pages/${params.slug}`)
    revalidatePath(`/${params.slug}`)
    redirect("/admin/pages")
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Page: {page.slug}</h1>
      </div>

      <form action={updatePage} className="space-y-6">
        <div className="grid gap-2">
          <label htmlFor="title" className="font-medium">Page Title</label>
          <input
            id="title"
            name="title"
            defaultValue={page.title}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="content" className="font-medium">Content (HTML allowed)</label>
          <textarea
            id="content"
            name="content"
            defaultValue={page.content}
            className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono"
            required
          />
          <p className="text-xs text-muted-foreground">
            You can use standard HTML tags like &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Save Changes
          </button>
          <a
            href="/admin/pages"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}
