import prisma from "@/lib/db"
import { ThemedPage } from "../(themed)/themed-page-wrapper"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { startDate: "desc" },
  })

  return (
    <ThemedPage pageKey="projects">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
              <h1 className="mb-8 text-3xl font-bold tracking-tighter sm:text-5xl">Our Projects</h1>

              {projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Projects will appear here once they are added from the admin dashboard.
                </p>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project: {
                    id: string
                    title: string
                    description: string
                    status: string
                    location: string | null
                    beneficiaries: number | null
                    budget: number | null
                  }) => (
                    <article
                      key={project.id}
                      className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col justify-between"
                    >
                      <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-xl font-semibold leading-none tracking-tight">{project.title}</h3>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {project.status}
                        </p>
                      </div>
                      <div className="p-6 pt-0">
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {project.location && <span>{project.location}</span>}
                          {typeof project.beneficiaries === "number" && (
                            <span>Beneficiaries: {project.beneficiaries}</span>
                          )}
                          {typeof project.budget === "number" && (
                            <span>Budget: {project.budget}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </ThemedPage>
  )
}
